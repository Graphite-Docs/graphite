'use strict';

// Load modules

const Hoek = require('hoek');


// Declare internals

const internals = {
    maxLength: 256,
    wildcards: ['x', 'X', '*'],
    any: Symbol('any')
};

//                              1:major         2:minor         3:patch          4:prerelease  5:build
//                              A         aB    C         cD    E         eF     G     gf H    I  ih d b
internals.versionRx = /^\s*[vV]?(\d+|[xX*])(?:\.(\d+|[xX*])(?:\.(\d+|[xX*])(?:\-?([^+]+))?(?:\+(.+))?)?)?\s*$/;

internals.strict = {
    tokenRx: /^[-\dA-Za-z]+(?:\.[-\dA-Za-z]+)*$/,
    numberRx: /^((?:0)|(?:[1-9]\d*))$/
};


exports.version = function (version, options) {

    return new internals.Version(version, options);
};


exports.range = function (range) {

    return new internals.Range(range);
};


exports.match = function (version, range) {

    try {
        return exports.range(range).match(version);
    }
    catch (ignoreErr) {
        return false;
    }
};


internals.Version = class {

    constructor(version, options = {}) {

        Hoek.assert(version, 'Missing version argument');

        if (version instanceof internals.Version) {
            return version;
        }

        if (typeof version === 'object') {
            this._copy(version);
        }
        else {
            this._parse(version, options);
        }

        this.format();
    }

    _copy(version) {

        this.major = version.major === undefined ? internals.any : version.major;
        this.minor = version.minor === undefined ? internals.any : version.minor;
        this.patch = version.patch === undefined ? internals.any : version.patch;
        this.prerelease = version.prerelease || [];
        this.build = version.build || [];
    }

    _parse(version, options) {

        Hoek.assert(typeof version === 'string', 'Version argument must be a string');
        Hoek.assert(version.length <= internals.maxLength, 'Version string too long');

        const match = version.match(internals.versionRx);
        if (!match) {
            throw new Error(`Invalid version string format: ${version}`);
        }

        this.major = internals.Version._number(match[1], 'major', options);
        this.minor = internals.Version._number(match[2] || 'x', 'minor', options);
        this.patch = internals.Version._number(match[3] || 'x', 'patch', options);

        this.prerelease = internals.Version._sub(match[4], 'prerelease', options);
        this.build = internals.Version._sub(match[5], 'build', options);
    }

    static _number(string, source, options) {

        if (internals.wildcards.includes(string)) {
            return internals.any;
        }

        if (options.strict) {
            Hoek.assert(string.match(internals.strict.numberRx), 'Value must be 0 or a number without a leading zero:', source);
        }

        const value = parseInt(string, 10);
        Hoek.assert(value <= Number.MAX_SAFE_INTEGER, 'Value must be positive and less than max safe integer:', source);
        return value;
    }

    static _sub(string, source, options) {

        if (!string) {
            return [];
        }

        if (options.strict) {
            Hoek.assert(string.match(internals.strict.tokenRx), 'Value can only contain dot-separated hyphens, digits, a-z or A-Z:', source);
        }

        const subs = [];
        const parts = string.split('.');
        for (const part of parts) {
            if (!part) {
                throw new Error(`Invalid empty ${source} segment`);
            }

            subs.push(part.match(/^\d+$/) ? internals.Version._number(part, source, { strict: options.strict }) : part);
        }

        return subs;
    }

    format() {

        this.version = `${internals.dot(this.major)}.${internals.dot(this.minor)}.${internals.dot(this.patch)}${internals.token(this.prerelease, '-')}${internals.token(this.build, '+')}`;
        this.dots = [this.major, this.minor, this.patch];
        this.wildcard = this.major === internals.any && this.minor === internals.any && this.patch === internals.any && !this.prerelease.length;
    }

    toString() {

        return this.version;
    }

    compare(to, options) {

        return internals.Version.compare(this, to, options);
    }

    static compare(a, b, options = {}) {

        let aFirst = -1;
        let bFirst = 1;

        a = exports.version(a, options);
        b = exports.version(b, options);

        // Mark incompatible prereleases

        if (options.range &&
            a.prerelease.length &&
            (a.major !== b.major || a.minor !== b.minor || a.patch !== b.patch || !b.prerelease.length)) {

            aFirst = -2;
            bFirst = 2;
        }

        // Compare versions

        for (let i = 0; i < 3; ++i) {
            const av = a.dots[i];
            const bv = b.dots[i];

            if (av === bv ||
                av === internals.any ||                             // Wildcard is equal to everything
                bv === internals.any) {

                continue;
            }

            return av - bv < 0 ? aFirst : bFirst;
        }

        // Compare prerelease

        if (!a.prerelease.length &&
            !b.prerelease.length) {

            return 0;
        }

        if (!!a.prerelease.length !== !!b.prerelease.length) {
            return (a.prerelease.length ? aFirst : bFirst);         // prerelease < none
        }

        for (let i = 0; ; ++i) {
            const ai = a.prerelease[i];
            const bi = b.prerelease[i];

            if (ai === undefined &&
                bi === undefined) {

                return 0;
            }

            if (ai === bi) {
                continue;
            }

            if (ai === undefined) {
                return aFirst;
            }

            if (bi === undefined) {
                return bFirst;
            }

            const an = Number.isFinite(ai);
            const bn = Number.isFinite(bi);

            if (an !== bn) {
                return an ? aFirst : bFirst;
            }

            return (a < b ? aFirst : bFirst);
        }
    }
};


internals.dot = (v) => {

    return (v === internals.any ? 'x' : v);
};


internals.token = (v, prefix) => {

    if (!v.length) {
        return '';
    }

    return `${prefix}${v.join('.')}`;
};


internals.Range = class {

    constructor(range, options) {

        this._settings = Object.assign({}, options);    // Shallow cloned
        this._anything = false;
        this._or = [];                                  // [and, and, ..., active]
        this._active = null;

        if (range !== undefined) {
            this.pattern(range);
        }

        this._another();
    }

    _another() {

        if (!this._active ||
            this._active.rules.length) {

            this._active = { rules: [] };
            this._or.push(this._active);
        }

        return this;
    }

    _rule(operator, version) {

        version = exports.version(version, this._settings);

        const compare = internals.operator(operator);
        this._active.rules.push({ compare, version, operator });

        return this;
    }

    get or() {

        return this._another();
    }

    equal(version) {

        return this._rule('=', version);
    }

    above(version) {

        return this._rule('>', version);
    }

    below(version) {

        return this._rule('<', version);
    }

    between(from, to) {

        this._rule('>=', from);
        this._rule('<=', to);
        return this;
    }

    minor(version) {        // ~1.2.3

        // minor(2.5.7)     ->      2.5.7 <= X < 2.6.0
        // minor(2.5.x)     ->      2.5.0 <= X < 2.6.0
        // minor(2.x.x)     ->      2.0.0 <= X < 3.0.0

        version = exports.version(version, this._settings);

        if (version.major === internals.any) {
            this._rule('=', version);
            return this;
        }

        this._rule('>=', version);

        if (version.minor === internals.any) {
            this._rule('<', { major: version.major + 1, minor: 0, patch: 0 });
        }
        else {
            this._rule('<', { major: version.major, minor: version.minor + 1, patch: 0 });
        }

        return this;
    }

    compatible(version) {       // ^1.2.3

        // compatible(2.5.7)     ->      2.5.7 <= X < 3.0.0
        // compatible(2.x.x)     ->      2.0.0 <= X < 3.0.0
        // compatible(0.1.x)     ->      0.1.0 <= X < 0.2.0

        version = exports.version(version, this._settings);

        if (version.major === internals.any) {
            this._rule('=', version);
            return this;
        }

        this._rule('>=', version);

        if (version.major === 0 &&
            version.minor !== internals.any) {

            if (version.minor === 0) {
                this._rule('<', { major: 0, minor: 0, patch: version.patch + 1 });
            }
            else {
                this._rule('<', { major: 0, minor: version.minor + 1, patch: 0 });
            }
        }
        else {
            this._rule('<', { major: version.major + 1, minor: 0, patch: 0 });
        }

        return this;
    }

    pattern(range) {

        try {
            this._pattern(range);
            return this;
        }
        catch (err) {
            throw new Error(`Invalid range: "${range}" because: ${err.message}`);
        }
    }

    _pattern(range) {

        if (range === '') {
            this._anything = true;
            return;
        }

        const normalized = internals.normalize(range);
        const ors = normalized.split(/\s*\|\|\s*/);
        for (const condition of ors) {
            if (!condition) {
                this._anything = true;
                return;
            }

            this._another();

            const ands = condition.split(/\s+/);
            for (const and of ands) {

                // Hyphen range

                const hyphen = and.indexOf('@');            // Originally " - "
                if (hyphen !== -1) {
                    const from = and.slice(0, hyphen);
                    const to = and.slice(hyphen + 1);
                    this.between(from, to);
                    continue;
                }

                // Prefix

                const parts = and.match(/^(\^|~|<\=|>\=|<|>|\=)?(.+)$/);
                const operator = parts[1];
                const version = exports.version(parts[2], this._settings);

                if (version.wildcard) {
                    this._anything = true;
                    return;
                }

                // Tilde

                if (operator === '~') {
                    this.minor(version);
                    continue;
                }

                // Caret

                if (operator === '^') {
                    this.compatible(version);
                    continue;
                }

                // One sided range

                if (operator) {
                    this._rule(operator, version);
                    continue;
                }

                // Version

                this.equal(version);
            }
        }
    }

    match(version) {

        version = exports.version(version, this._settings);       // Always parse to validate

        if (this._anything) {
            return !version.prerelease.length;
        }

        for (const { rules } of this._or) {
            if (!rules.length) {
                continue;
            }

            let matches = 0;
            let excludes = 0;

            for (const rule of rules) {
                const compare = version.compare(rule.version, Object.assign(this._settings, { range: true }));
                const exclude = Math.abs(compare) === 2;

                if (rule.compare.includes(compare / (exclude ? 2 : 1))) {
                    ++matches;
                    if (exclude) {
                        ++excludes;
                    }
                }
                else {
                    break;
                }
            }

            if (matches === rules.length &&
                excludes < matches) {

                return true;
            }
        }

        return false;
    }

    toString() {

        if (this._anything) {
            return '*';
        }

        let string = '';
        for (const { rules } of this._or) {
            if (!rules.length) {
                continue;
            }

            const conditions = [];
            for (const rule of rules) {
                conditions.push(`${rule.operator !== '=' ? rule.operator : ''}${rule.version.version}`);
            }

            string += (string ? '||' : '') + conditions.join(' ');
        }

        return string;
    }
};


internals.operator = function (compare) {

    switch (compare) {
        case '=': return [0];
        case '>': return [1];
        case '>=': return [0, 1];
        case '<': return [-1];
        case '<=': return [0, -1];
    }
};


internals.normalize = function (range) {

    return range
        .replace(/ \- /g, '@')                                                          // Range to excluded symbol
        .replace(/~>/g, '~')                                                            // Legacy npm operator
        .replace(/(\^|~|<\=|>\=|<|>|\=)\s*([^\s]+)/g, ($0, $1, $2) => `${$1}${$2}`);    // Space between operator and version
};

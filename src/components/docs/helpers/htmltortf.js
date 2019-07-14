export function convertHtmlToRtf(html) {
    if (!(typeof html === "string" && html)) {
        return null;
    }
  
    var tmpRichText, hasHyperlinks;
    var richText = html;
  
    // Singleton tags
    richText = richText.replace(/<(?:hr)(?:\s+[^>]*)?\s*[\/]?>/ig, "{\\pard \\brdrb \\brdrs \\brdrw10 \\brsp20 \\par}\n{\\pard\\par}\n");
    richText = richText.replace(/<(?:br)(?:\s+[^>]*)?\s*[\/]?>/ig, "{\\pard\\par}\n");
  
    // Empty tags
    richText = richText.replace(/<(?:p|div|section|article)(?:\s+[^>]*)?\s*[\/]>/ig, "{\\pard\\par}\n");
    richText = richText.replace(/<(?:[^>]+)\/>/g, "");
  
    // Hyperlinks
    richText = richText.replace(
        /<a(?:\s+[^>]*)?(?:\s+href=(["'])(?:javascript:void\(0?\);?|#|return false;?|void\(0?\);?|)\1)(?:\s+[^>]*)?>/ig,
        "{{{\n");
    tmpRichText = richText;
    richText = richText.replace(
        /<a(?:\s+[^>]*)?(?:\s+href=(["'])(.+)\1)(?:\s+[^>]*)?>/ig,
        "{\\field{\\*\\fldinst{HYPERLINK\n \"$2\"\n}}{\\fldrslt{\\ul\\cf1\n");
    hasHyperlinks = richText !== tmpRichText;
    richText = richText.replace(/<a(?:\s+[^>]*)?>/ig, "{{{\n");
    richText = richText.replace(/<\/a(?:\s+[^>]*)?>/ig, "\n}}}");
  
    // Start tags
    richText = richText.replace(/<(?:b|strong)(?:\s+[^>]*)?>/ig, "{\\b\n");
    richText = richText.replace(/<(?:i|em)(?:\s+[^>]*)?>/ig, "{\\i\n");
    richText = richText.replace(/<(?:u|ins)(?:\s+[^>]*)?>/ig, "{\\ul\n");
    richText = richText.replace(/<(?:strike|del)(?:\s+[^>]*)?>/ig, "{\\strike\n");
    richText = richText.replace(/<sup(?:\s+[^>]*)?>/ig, "{\\super\n");
    richText = richText.replace(/<sub(?:\s+[^>]*)?>/ig, "{\\sub\n");
    richText = richText.replace(/<(?:p|div|section|article)(?:\s+[^>]*)?>/ig, "{\\pard\n");
  
    // End tags
    richText = richText.replace(/<\/(?:p|div|section|article)(?:\s+[^>]*)?>/ig, "\n\\par}\n");
    richText = richText.replace(/<\/(?:b|strong|i|em|u|ins|strike|del|sup|sub)(?:\s+[^>]*)?>/ig, "\n}");
  
    // Strip any other remaining HTML tags [but leave their contents]
    richText = richText.replace(/<(?:[^>]+)>/g, "");
  
    // Prefix and suffix the rich text with the necessary syntax
    richText =
        "{\\rtf1\\ansi\n" + (hasHyperlinks ? "{\\colortbl\n;\n\\red0\\green0\\blue255;\n}\n" : "") + richText +  "\n}";
  
    return richText;
  }
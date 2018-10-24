import {
  putFile,
  getFile
} from 'blockstack';

export function handleEmailSetting(event) {
  const target = event.target;
  const value = target.type === 'checkbox' ? target.checked : target.value;
  const name = target.name;

  this.setState({
    [name]: value
  });
}

export function handleProfileEmail(e) {
  this.setState({ profileEmail: e.target.value})
}

export function saveProfile() {
  const object = {};
  object.emailOK = this.state.emailOK;
  object.profileEmail = this.state.profileEmail;
  putFile('graphiteprofile.json', JSON.stringify(object), {encrypt: false})
    .then(() => {
      window.Materialize.toast("Profile updated!", 4000);
    })
}

export function loadProfile() {
  getFile('graphiteprofile.json', {decrypt: false})
    .then((fileContents) => {
      this.setState({ emailOK: JSON.parse(fileContents).emailOK, profileEmail: JSON.parse(fileContents).profileEmail })
    })
}

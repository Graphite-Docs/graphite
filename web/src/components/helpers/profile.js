import {
  putFile,
  getFile
} from 'blockstack';

export function handleEmailSetting(props) {
  console.log(props)
  if(props === 'yes') {
    this.setState({ emailOK: true })
  } else {
    this.setState({ emailOK: false })
  }
  // const target = event.target;
  // const value = target.type === 'checkbox' ? target.checked : target.value;
  // const name = target.name;
  //
  // this.setState({
  //   [name]: value
  // });
}

export function handleProfileEmail(e) {
  console.log(e.target.value)
  this.setState({ profileEmail: e.target.value})
}

export function saveProfile() {
  const object = {};
  object.emailOK = this.state.emailOK;
  object.profileEmail = this.state.profileEmail;
  putFile('graphiteprofile.json', JSON.stringify(object), {encrypt: false})
    .then(() => {
      // window.Materialize.toast("Profile updated!", 4000);
    })
}

export function loadProfile() {
  getFile('graphiteprofile.json', {decrypt: false})
    .then((fileContents) => {
      if(fileContents) {
        this.setState({ emailOK: JSON.parse(fileContents).emailOK, profileEmail: JSON.parse(fileContents).profileEmail })
      } else {
        this.setState({ emailOK: false, profileEmail: "" })
      }

    })
}

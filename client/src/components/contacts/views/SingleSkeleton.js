import React, { Component } from 'reactn';
import { Link } from 'react-router-dom';
import { Image, Segment, Icon } from 'semantic-ui-react'
import {Menu as MainMenu} from 'semantic-ui-react';
const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

class SingleSkeleton extends Component {

  render() {
    const { contact } = this.global;
    let avatarImg = contact.img ? contact.img : contact.image ? contact.image : avatarFallbackImage;

      return (
        <div>
          <MainMenu style={{ borderRadius: "0", background: "#000", color: "#fff" }}>
            <MainMenu.Item>
              <Link style={{color: "#fff"}} to={'/contacts'}>
                <Icon name='arrow left' />
              </Link>
            </MainMenu.Item>
            <MainMenu.Item style={{color: "#fff"}}>
                <span className='title-skel-div'></span>
            </MainMenu.Item>
            </MainMenu>


          <div className="contain">
            <div className="margin-top-65" >
              <div className="col-25-left">
                <Segment>
                  <Image className='contact-avatar' src={avatarImg} />
                  <div className="contact-card">
                    <div className='grey-skel-div'></div>
                    <div className='grey-skel-div'></div>
                    <div className='grey-skel-div'></div>
                    <div>
                      <div style={{textAlign: "center", marginTop: "10px"}}>
                        <Icon circular name='twitter' />
                        <Icon circular name='github' />
                        <Icon circular name='linkedin' />
                      </div>
                    </div>
                  </div>
                </Segment>
              </div>
              <div className="col-75-right">
                <Segment>
                <div className="contact-details">
                  <div className="line"><span className="title-span"></span><div className='grey-skel-div'></div></div>
                  <div className="line"><span className="title-span"></span><div className='grey-skel-div'></div></div>
                  <div className="line"><span className="title-span"></span><div className='grey-skel-div'></div></div>
                  <div className="line"><span className="title-span"></span><div className='grey-skel-div'></div></div>
                  <div className="line"><span className="title-span"></span><div className='grey-skel-div'></div></div>
                  <div className="line"><span className="title-span"></span><div className='grey-skel-div'></div></div>
                  <div className="line"><span className="title-span"></span><div className='grey-skel-div'></div></div>
                  <div className="line"><span className="title-span"></span><div className='grey-skel-div'></div></div>
                </div>
                </Segment>
              </div>
            </div>
          </div>
        </div>
       );
  }
}

export default SingleSkeleton;

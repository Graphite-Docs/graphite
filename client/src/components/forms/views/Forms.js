import React, { Component } from 'reactn';
import { Container, Input, Grid, Button, Icon, Dropdown, Modal, Menu, Label, Sidebar } from 'semantic-ui-react';
import Nav from '../../shared/views/Nav';
import { Link } from 'react-router-dom';
import FormsSkeleton from './FormsSkeleton';
import MyForms from './MyForms';
import TeamForms from './TeamForms';
const forms = require('../helpers/forms');
const uuid = require('uuidv4');

class Forms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      open: false,
      file: {},
      onboarding: false,
      run: false,
      activeItem: "My Forms"
    }
  }

  componentDidMount() {
    
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  tagFilter = (tag, type) => {
    this.setState({ visible: false });
    forms.tagFormsFilter(tag, type);
  }

  dateFilter = (date, type) => {
    this.setState({ visible: false });
    forms.dateFormsFilter(date, type)
  }


  render() {
    const { loading, graphitePro, contacts, appliedFilter, currentPage, formsPerPage, filteredForms } = this.global;
    const { visible, activeItem } = this.state;
    let forms;
    if (filteredForms.length > 0) {
      forms = filteredForms;
    } else {
      forms = [];
    }

    const indexOfLastForm = currentPage * formsPerPage;
    const indexOfFirstForm = indexOfLastForm - formsPerPage;
    const currentForms = forms.slice(0).reverse();

    let tags = currentForms.map(a => a.tags);
    let newTags = tags.filter(function(n){ return n !== undefined });
    let mergedTags = [].concat.apply([], newTags);
    let uniqueTags = [];
    window.$.each(mergedTags, function(i, el) {
      if(window.$.inArray(el, uniqueTags) === -1) uniqueTags.push(el);
    })

    let date = currentForms.map(a => a.created);
    let mergedDate = [].concat.apply([], date);
    let uniqueDate = [];
    window.$.each(mergedDate, function(i, el) {
      if(window.$.inArray(el, uniqueDate) === -1) uniqueDate.push(el);
    })

    // Logic for displaying page numbers
   const pageNumbers = [];
   for (let i = 1; i <= Math.ceil(forms.length / formsPerPage); i++) {
     pageNumbers.push(i);
   }


   const renderPageNumbers = pageNumbers.map(number => {
          return (
            <Menu.Item key={number} style={{ background:"#282828", color: "#fff", borderRadius: "0" }} name={number.toString()} active={this.global.currentPage.toString() === number.toString()} onClick={() => forms.handlePageChange(number)} />
          );
        });

    if(loading) {
      return <FormsSkeleton />
    } else {
      return (
        <div>
        <Nav />
        <Container style={{marginTop:"65px"}}>
        <Grid stackable columns={2}>
          <Grid.Column>
            <h2>Forms ({currentForms.length})
            <Link to={`/forms/new/${uuid()}`}><Button style={{borderRadius: "0", marginLeft: "10px"}} secondary>New</Button></Link>
              {appliedFilter === false ? <span className="filter"><button className='link-button' onClick={() => this.setState({visible: true})} style={{fontSize:"16px", marginLeft: "10px", cursor: "pointer", color: "#4183c4"}}>Filter<Icon name='caret down' /></button></span> : <span className="hide"><button className='link-button'>Filter</button></span>}
              {appliedFilter === true ? <span className="filter"><Label style={{fontSize:"16px", marginLeft: "10px"}} as='a' basic color='grey' onClick={forms.clearFormFilter}>Clear</Label></span> : <div />}
            </h2>
          </Grid.Column>
          <Grid.Column>
            <Input onChange={forms.filterFormsList} icon='search' placeholder='Search...' />
          </Grid.Column>
        </Grid>

        <Sidebar
          as={Menu}
          animation='overlay'
          icon='labeled'
          inverted
          onHide={() => this.setState({ visible: false })}
          vertical
          visible={visible}
          width='thin'
          style={{width: "250px"}}
        >


          <Menu.Item as='a'>
            Tags
            <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
              <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
              {
                uniqueTags.map(tag => {
                  return (
                    <Dropdown.Item key={Math.random()} text={tag} onClick={() => this.tagFilter(tag, 'tag')} />
                  )
                })
              }
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
          <Menu.Item as='a'>
            Date
            <Dropdown style={{marginTop: "10px", borderRadius: "0"}} name='Date'>
              <Dropdown.Menu style={{left: "-70px", borderRadius: "0"}}>
              {
                uniqueDate.map(date => {
                  return (
                    <Dropdown.Item key={Math.random()} text={date} onClick={() => this.dateFilter(date, 'date')} />
                  )
                })

              }
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        </Sidebar>

        <div className="margin-top-20">
          <Menu secondary>
          <Menu.Item name='My Forms' active={activeItem === 'My Forms'} onClick={this.handleItemClick} />
              <Menu.Menu position="right">
                  {
                      graphitePro ? 
                      <Menu.Item name="Team Forms" active={activeItem === 'Team Forms'} onClick={this.handleItemClick}><Icon name="group" />Team Forms</Menu.Item>
                      :
                      <Modal closeIcon trigger={<Menu.Item><Icon name="group" />Team Files</Menu.Item>}>
                          <Modal.Header>Working as a team?</Modal.Header>
                          <Modal.Content>
                          <Modal.Description>
                              <p>Graphite Pro has all the team features you and the rest of your organization could need. <Link to={'/trial'}>Sign up today for a 30-day free trial.</Link></p>
                              <Link to={'/trial'}><Button secondary>Try Graphite Pro Free</Button></Link>
                          </Modal.Description>
                          </Modal.Content>
                      </Modal>
                  }
                  
              </Menu.Menu> 
          </Menu>
          </div>
          { activeItem === "Team Forms" ? 
            <TeamForms /> : 
            <MyForms 
              currentForms={currentForms}
              indexOfFirstForm={indexOfFirstForm}
              indexOfLastForm={indexOfLastForm}
              contacts={contacts}
              pageNumbers={pageNumbers}
              renderPageNumbers={renderPageNumbers}
            /> 
          }
          </Container>
        </div>
       );
    }
  }
}

export default Forms;

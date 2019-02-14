import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Header from './shared/Header';
import Loading from './shared/Loading';
import { Grid, Container, Input, List, Icon } from 'semantic-ui-react';
import {
  listFiles
} from 'blockstack';


export default class Explorer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allFiles: [],
      filteredValue: [],
      loading: false
    }
  }

  componentDidMount() {
    let allFiles = [];
    listFiles((file) => {
      allFiles.push(file);
      this.setState({ allFiles: allFiles, filteredValue: allFiles });
      return true;
    })
  }

  filterList = (event) => {
    var updatedList = this.state.allFiles;
    updatedList = updatedList.filter(function(item){
      if(item !== undefined) {
        return item.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1;
      }
      return null;
    });
    this.setState({filteredValue: updatedList});
  }

  render(){
    const { filteredValue } = this.state;
    const { loading } = this.props;
    let files;
    if(filteredValue) {
      files = filteredValue;
    } else {
      files = [];
    }
    if(!loading) {
      return(
        <div>
        <Header />
        <Container>
          <div style={{marginTop: "65px"}}>
          <Grid stackable columns={2} style={{marginBottom: "25px"}}>
            <Grid.Column>
              <h2>Graphite Explorer ({filteredValue.length})
              </h2>
            </Grid.Column>
            <Grid.Column>
              <Input placeholder="Search files" onChange={this.filterList}/>
            </Grid.Column>
          </Grid>
            <p style={{marginBottom: "25px"}}>Below, you will find all of the files you have ever stored in Graphite. Go ahead, explore!</p>
            <div>
            <List divided verticalAlign='middle'>
              {
                files.map(file => {
                  return(
                    <List.Item key={file} style={{padding: "15px"}}>
                      <Icon name='folder' />
                      <List.Content>
                        <List.Header><Link to={'/file-explorer/' + file}>{file}</Link></List.Header>
                      </List.Content>
                    </List.Item>
                  )
                })
              }
            </List>
            </div>
          </div>
        </Container>
        </div>
      )
    } else {
      return (
        <Loading />
      )
    }

  }
}

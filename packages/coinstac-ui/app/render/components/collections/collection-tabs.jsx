import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Tab, Tabs } from 'react-bootstrap';
import CollectionAbout from './collection-about';
import CollectionFiles from './collection-files';
import CollectionConsortia from './collection-consortia';
import { getAssociatedConsortia, saveAssociatedConsortia, saveCollection } from '../../state/ducks/collections';

const styles = {
  tab: {
    marginTop: 10,
  },
};

class CollectionTabs extends Component {
  constructor(props) {
    super(props);

    const { collections, params } = props;
    let collection = {
      name: '',
      description: '',
      fileGroups: [],
      associatedConsortia: [],
    };

    if (collections.length > 0 && params.collectionId) {
      collection = collections.find(col => col.id.toString() === params.collectionId);
      this.props.getAssociatedConsortia(collection.associatedConsortia);
    }

    this.state = {
      collection,
    };

    this.saveCollection = this.saveCollection.bind(this);
    this.updateAssociatedConsortia = this.updateAssociatedConsortia.bind(this);
    this.updateCollection = this.updateCollection.bind(this);
  }

  saveCollection(e) {
    if (e) {
      e.preventDefault();
    }

    this.props.saveCollection(this.state.collection)
    // TODO: Use redux to display success/failure messages after mutations
    .catch(({ graphQLErrors }) => {
      console.log(graphQLErrors);
    });
  }

  updateAssociatedConsortia(cons) {
    this.props.saveAssociatedConsortia(cons);

    if (this.state.collection.associatedConsortia.indexOf(cons.id) === -1) {
      this.setState(prevState => ({
        collection: {
          ...prevState.collection,
          associatedConsortia: [...prevState.collection.associatedConsortia, cons.id],
        },
      }));
    }
  }

  updateCollection(update, callback) {
    this.setState(prevState => ({
      collection: { ...prevState.collection, [update.param]: update.value },
    }), callback);
  }

  render() {
    const title = this.state.collection.name
      ? this.state.collection.name
      : 'New Collection';

    return (
      <div>
        <div className="page-header clearfix">
          <h1 className="pull-left">{title}</h1>
        </div>
        <Tabs defaultActiveKey={1} id="collection-tabs">
          <Tab eventKey={1} title="About" style={styles.tab}>
            <CollectionAbout
              collection={this.state.collection}
              saveCollection={this.saveCollection}
              updateCollection={this.updateCollection}
            />
          </Tab>
          <Tab
            eventKey={2}
            title="Files"
            disabled={typeof this.state.collection.id === 'undefined'}
            style={styles.tab}
          >
            <CollectionFiles
              collection={this.state.collection}
              saveCollection={this.saveCollection}
              updateCollection={this.updateCollection}
            />
          </Tab>
          <Tab
            eventKey={3}
            title="Consortia"
            disabled={typeof this.state.collection.id === 'undefined'}
            style={styles.tab}
          >
            <CollectionConsortia
              associatedConsortia={this.props.associatedConsortia}
              collection={this.state.collection}
              consortia={this.props.consortia}
              saveCollection={this.saveCollection}
              updateAssociatedConsortia={this.updateAssociatedConsortia}
              updateCollection={this.updateCollection}
            />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

CollectionTabs.defaultProps = {
  associatedConsortia: [],
};

CollectionTabs.propTypes = {
  associatedConsortia: PropTypes.array,
  collections: PropTypes.array.isRequired,
  consortia: PropTypes.array.isRequired,
  getAssociatedConsortia: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  saveAssociatedConsortia: PropTypes.func.isRequired,
  saveCollection: PropTypes.func.isRequired,
};

function mapStateToProps({ collections: { associatedConsortia, collections } }) {
  return { associatedConsortia, collections };
}

export default connect(mapStateToProps,
  { getAssociatedConsortia, saveAssociatedConsortia, saveCollection }
)(CollectionTabs);
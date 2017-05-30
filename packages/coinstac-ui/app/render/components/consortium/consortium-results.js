import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import { setExpandedResults } from '../../state/ducks/consortia-page';

import ConsortiumResult from './consortium-result';

class ConsortiumResults extends Component {
  constructor(props) {
    super(props);

    this.state = { wentToResult: false };
    this.goToResults = this.goToResults.bind(this);
  }

  componentWillMount() {
    const { initialResultId, setExpandedResults } = this.props;

    setExpandedResults(initialResultId);
  }

  componentWillUnmount() {
    const { setExpandedResults } = this.props;

    setExpandedResults(null);
  }

  goToResults() {
    const { expandedResults } = this.props;

    /* TODO: Timeout used to delay querying ids until results list items are rendered.
     *       Find another way to delay action until data loads.
     */
    setTimeout(() => {
      if (document.querySelector(`#C${expandedResults[0]}`)) {
        document.querySelector(`#C${expandedResults[0]}`).scrollIntoView();
      }
    }, 500);
    this.setState({ wentToResult: true });
  }

  toggleCollapse(resultId) {
    const { setExpandedResults } = this.props;

    setExpandedResults(resultId);
  }

  render() {
    const { expandedResults, computations, remoteResults } = this.props;
    const content = !remoteResults || !remoteResults.length ?
    (
      <Alert bsStyle="info">No results.</Alert>
    ) :
    (
      <ul className="list-unstyled">
        {remoteResults
          .slice(0)
          .sort(ConsortiumResults.compareRemoteResults)
          .map((result, index) => {
            const computation = computations.find(c => {
              return c._id === result.computationId;
            });

            return (
              <li key={index} id={`C${result.computationId}`}>
                <ConsortiumResult
                  computation={computation}
                  expanded={expandedResults.includes(result.computationId)}
                  toggleCollapse={() => this.toggleCollapse(result.computationId)}
                  {...result}
                />
              </li>
            );
          })
        }
      </ul>
    );

    return (
      <section id="results">
        <h2 className="h4">Results:</h2>
        {content}
        {remoteResults.length && !this.state.wentToResult && this.goToResults()}
      </section>
    );
  }
}

ConsortiumResults.displayName = 'ConsortiumResults';

ConsortiumResults.propTypes = {
  expandedResults: PropTypes.array.isRequired,
  computations: PropTypes.array,
  initialResultId: PropTypes.string.isRequired,
  remoteResults: PropTypes.array,
  setExpandedResults: PropTypes.func,
};

/**
 * Compare remote results for sorting purposes.
 *
 * @param {RemoteResult} a
 * @param {RemoteResult} b
 * @returns {number}
 */
ConsortiumResults.compareRemoteResults = (
  { endDate: a },
  { endDate: b }
) => {
  if (a < b) {
    return 1;
  } else if (a > b) {
    return -1;
  }

  return 0;
};

const mapStateToProps = ({ consortiaPage: { expandedResults } }) => {
  return { expandedResults };
};

export default connect(mapStateToProps, { setExpandedResults })(ConsortiumResults);

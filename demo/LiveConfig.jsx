import React, { Component } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';
import isEmpty from 'lodash/isEmpty';

/*
* The LiveConfig component which will render - DataGrid.
 * @type {class}
*/
class LiveConfig extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const container = document.getElementById('jsoneditor');
    const options = {
      'mode': 'tree',
      'indentation': 0,
      'navigationBar': false,
      'mainMenuBar': true,
      'onChangeJSON': (json) => {
        this.props.onChangeMetaData(json);
      },
    };
    const editor = new JSONEditor(container, options);
    const json = this.props.metaData;
    editor.set(json);
  }

  render() {
    return (
      <div className="live-config">
        <div
          className="header-column"
        >Live Configurations.
        </div>
        <div id="jsoneditor" style={{ width: '400px', height: 'auto' }} />
      </div>
    );
  }
}


export default LiveConfig;

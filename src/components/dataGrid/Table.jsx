import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';

import { filterData, getFilterData } from '../.././utils/filterData';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableDrawer from './TableDrawer';
import TableFooter from './TableFooter';
import { paginatedData, getNoOfPages, getSortedData } from '../.././utils/CommonUtils';
import '../../datagrid.css';
import CustomLoader from './CustomLoader';
/**
 * The Table component for the grid which will render -
 * TableDrawer, TableHeader, TableBody and TableFooter.
 * It will also handle the search, sort, filter and pagination functionality for the grid.
 *
 * @type {class}
 */
class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allCheckBox: false,
      currentPage: 1,
      recordsPerPage: props.metaData.recordsPerPage,
      appliedFilter: {},
      originalData: props.data,
      currentData: props.data,
      originalMetaData: props.metaData,
      currentMetaData: props.metaData,
      isLoading: false,
      sort: {
        sortOrder: '',
        columnName: '',
        columnType: '',
        emptyCells: '',
      },
    };
    this.onSearch = this.onSearch.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onPagination = this.onPagination.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.handleReRenderButtonClick = this.handleReRenderButtonClick.bind(this);
    this.renderTableBody = this.renderTableBody.bind(this);
    this.setSortObject = this.setSortObject.bind(this);
    this.handleAllCheckBoxChange = this.handleAllCheckBoxChange.bind(this);
    this.handleSingleCheckBoxChange = this.handleSingleCheckBoxChange.bind(this);
    this.renderLoader = this.renderLoader.bind(this);
    this.handleSelectedRows = this.handleSelectedRows.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { columnName, columnType, sortOrder, emptyCells } = this.state.sort;
    if (!isEqual(nextProps.data, this.props.data)
      || !isEqual(nextProps.metaData, this.props.metaData)) {
      let temporaryData = filterData(this.state.appliedFilter, nextProps.data);
      temporaryData = getSortedData(
        {
          columnName,
          columnType,
          sortOrder,
          data: temporaryData,
          emptyCells,
        });
      this.setState({
        originalData: nextProps.data,
        currentData: temporaryData,
        originalMetaData: nextProps.metaData,
        currentMetaData: nextProps.metaData,
        recordsPerPage: nextProps.metaData.recordsPerPage,
      });
    }
  }

  setSortObject(columnName, sortOrder, columnType, emptyCells) {
    this.setState({
      sort: {
        ...this.state.sort,
        columnName,
        sortOrder,
        columnType,
        emptyCells,
      },
    });
  }

  handleSelectedRows(selectedRows, temporaryAllCheck) {
    this.setState({
      isLoading: false,
      allCheckBox: temporaryAllCheck,
    });
    this.props.getSelectedRow(selectedRows);
  }

  handleAllCheckBoxChange() {
    this.setState({
      isLoading: true,
    });
    const temporaryAllCheck = !this.state.allCheckBox;
    const selectedRows = this.state.currentData.map(currentDataObj => (
      { ...currentDataObj, isChecked: temporaryAllCheck }
    ));
    setTimeout(() => this.handleSelectedRows(selectedRows, temporaryAllCheck), 100);
  }

  handleSingleCheckBoxChange(event, data) {
    const selectedRows = [];
    if (event.target.checked) {
      selectedRows.push({ ...data, isChecked: true });
    } else if (!event.target.checked) {
      selectedRows.push({ ...data, isChecked: false });
    }
    this.props.getSelectedRow(selectedRows);
  }

  renderTableBody() {
    const { currentData, recordsPerPage, currentPage } = this.state;
    const tableRowsData = paginatedData({ currentData, recordsPerPage, currentPage });
    if (isEmpty(currentData)) {
      return (
        <div className="render-message">
          No Results Found.
        </div>
      );
    }
    return (
      <TableBody
        handleSingleCheckBoxChange={this.handleSingleCheckBoxChange}
        tableData={tableRowsData}
        currentMetaData={this.state.currentMetaData}
        styles={this.props.styles}
      />
    );
  }

  handleReRenderButtonClick() {
    this.setState({
      appliedFilter: {},
      currentData: this.state.originalData,
      sort: {
        sortOrder: '',
        columnName: '',
        columnType: '',
        emptyCells: '',
      },
    });
  }

  onFilterChange(inputValue) {
    const { columnName, columnType, sortOrder, emptyCells } = this.state.sort;
    let { appliedFilter } = this.state;
    appliedFilter = {
      ...appliedFilter,
      [inputValue.selectedColumn]: inputValue.searchString,
    };
    const temporaryData = getSortedData(
      {
        columnName,
        columnType,
        sortOrder,
        data: this.state.originalData,
        emptyCells,
      });
    this.setState({
      appliedFilter,
      currentData: filterData(appliedFilter, temporaryData),
      currentPage: 1,
    });
  }

  onSearch(searchInput) {
    const searchData = getFilterData(searchInput, this.state.originalData);
    this.setState({
      currentData: searchData,
      currentPage: 1,
    });
  }

  onSort(columnId, columnType, emptyCells) {
    // If current sort order is ascending then assign next sort order to descending
    if (this.state.sort.sortOrder === 'asc') {
      const sortedData = getSortedData(
        {
          columnName: columnId,
          columnType,
          sortOrder: 'desc',
          data: this.state.currentData,
          emptyCells,
        });
      this.setState({
        currentData: sortedData,
        sort: { ...this.state.sort, sortOrder: 'desc', columnType, emptyCells },
      });

    } else {
      // If current sort order is descending then assign next sort order to ascending
      const sortedData = getSortedData(
        {
          columnName: columnId,
          columnType,
          sortOrder: 'asc',
          data: this.state.currentData,
          emptyCells,
        });
      this.setState({
        currentData: sortedData,
        sort: { ...this.state.sort, sortOrder: 'asc', columnType, emptyCells },
      });
    }
  }

  onPagination(value) {
    let { currentPage } = this.state;
    const noOfPages
      = getNoOfPages(this.state.currentData, this.state.originalMetaData.recordsPerPage);
    if (value === 'lastPage' && currentPage < noOfPages) {
      currentPage = noOfPages;
    }
    if (value === 'firstPage') {
      currentPage = 1;
    }
    if (value === 'increment' && currentPage < noOfPages) {
      currentPage += 1;
    } else if (value === 'decrement' && currentPage > 1) {
      currentPage -= 1;
    }
    this.setState({
      currentPage,
    });
  }

  renderTableDrawer(currentData, positions, drawerPosition) {
    return (
      <div className={`table-drawer table-drawer__${drawerPosition}`}>
        <TableDrawer
          onClickAllExport={this.props.onClickAllExport}
          positions={positions}
          currentData={currentData}
          currentMetaData={this.state.currentMetaData}
          styles={this.props.styles}
          onPagination={this.onPagination}
          onSearch={this.onSearch}
          onSort={this.onSort}
          currentPage={this.state.currentPage}
          recordsPerPage={this.state.recordsPerPage}
          handleReRenderButtonClick={this.handleReRenderButtonClick}
        />
      </div>
    );
  }

  renderLoader() {
    const { isLoading, currentMetaData: { loaderColor = '#5f8ca6' } } = this.state;
    if (isLoading) {
      return <CustomLoader loaderColor={loaderColor} />;
    }
    return null;
  }
  render() {
    return (
      <div className="table">
        {this.renderLoader()}
        {this.renderTableDrawer(this.state.currentData, this.state.currentMetaData.topDrawer, 'top')}
        <div className="render-table" style={this.props.styles.gridTable}>
          <TableHeader
            allCheckBox={this.state.allCheckBox}
            handleAllCheckBoxChange={this.handleAllCheckBoxChange}
            sort={this.state.sort}
            setSortObject={this.setSortObject}
            currentMetaData={this.state.currentMetaData}
            styles={this.props.styles}
            onSort={this.onSort}
            onSearch={this.onSearch}
            onFilterChange={this.onFilterChange}
            appliedFilter={this.state.appliedFilter}
          />
          {this.renderTableBody()}
        </div>
        <TableFooter
          originalData={this.state.originalData}
          currentMetaData={this.state.currentMetaData}
          styles={this.props.styles}
        />
        {this.renderTableDrawer(this.state.currentData, this.state.currentMetaData.bottomDrawer, 'bottom')}
      </div>
    );
  }

}

Table.propTypes = {
  getSelectedRow: PropTypes.func,
  onClickAllExport: PropTypes.func,
  data: PropTypes.array,
  metaData: PropTypes.object,
  styles: PropTypes.object,
};

Table.defaultProps = {
  getSelectedRow: () => {},
  onClickAllExport: () => {},
  data: [],
  metaData: {},
  styles: {},
};

export default Table;

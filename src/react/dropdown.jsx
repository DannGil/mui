/**
 * MUI React dropdowns module
 * @module react/dropdowns
 */
/* jshint quotmark:false */
// jscs:disable validateQuoteMarks

'use strict';

import React from 'react';

import Button from './button';
import Caret from './caret';
import * as jqLite from '../js/lib/jqLite';
import * as util from '../js/lib/util';


const dropdownClass = 'mui-dropdown',
      menuClass = 'mui-dropdown__menu',
      menuRightClass = menuClass + '--right',
      menuUpClass = menuClass + '--up',
      openClass = 'mui--is-open';


/**
 * Dropdown constructor
 * @class
 */
class Dropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      menuTop: 0
    }
    let cb = util.callback;
    this.selectCB = cb(this, 'select');
    this.onClickCB = cb(this, 'onClick');
    this.onOutsideClickCB = cb(this, 'onOutsideClick');
    this.onKeyDownCB = cb(this, 'onKeyDown');
  }

  static defaultProps = {
    className: '',
    color: 'default',
    variant: 'default',
    size: 'default',
    label: '',
    alignMenu: 'left',
    dropup: false,
    onClick: null,
    onSelect: null,
    disabled: false
  };

  componentWillUpdate(nextProps, nextState) {
    let doc = document;

    if (!this.state.opened && nextState.opened) {
      doc.addEventListener('click', this.onOutsideClickCB);
      doc.addEventListener('keydown', this.onKeyDownCB);
    } else if (this.state.opened && !nextState.opened) {
      doc.removeEventListener('click', this.onOutsideClickCB);
      doc.removeEventListener('keydown', this.onKeyDownCB);
    }
  }

  componentWillUnmount() {
    let doc = document;
    doc.removeEventListener('click', this.onOutsideClickCB);
    doc.removeEventListener('keydown', this.onKeyDownCB);
  }

  onClick(ev) {
    // only left clicks
    if (ev.button !== 0) return;

    // exit if toggle button is disabled
    if (this.props.disabled) return;

    if (!ev.defaultPrevented) {
      this.toggle();

      // execute <Dropdown> onClick method
      let fn = this.props.onClick;
      fn && fn(ev);
    }
  }

  toggle() {
    // exit if no menu element
    if (!this.props.children) {
      return util.raiseError('Dropdown menu element not found');
    }

    if (this.state.opened) this.close();
    else this.open();
  }

  open() {
    // position menu element below toggle button
    let wrapperRect = this.wrapperElRef.getBoundingClientRect(),
      toggleRect;

    toggleRect = this.buttonElRef.buttonElRef.getBoundingClientRect();

    this.setState({
      opened: true,
      menuTop: toggleRect.top - wrapperRect.top + toggleRect.height
    });
  }

  close() {
    this.setState({ opened: false });
  }

  select(ev) {
    // onSelect callback
    if (this.props.onSelect && ev.target.tagName === 'A') {
      this.props.onSelect(ev.target.getAttribute('data-mui-value'));
    }

    // close menu
    if (!ev.defaultPrevented) this.close();
  }

  onOutsideClick(ev) {
    let isClickInside = this.wrapperElRef.contains(ev.target);
    if (!isClickInside) this.close();
  }

  onKeyDown(ev) {
    // close menu on escape key
    let key = ev.key;
    if (key === 'Escape' || key === 'Esc') this.close();
  }

  render() {
    let buttonEl,
        menuEl,
        labelEl;

    const { children, className, color, variant, size, label, alignMenu,
      dropup, onClick, onSelect, disabled, ...reactProps } = this.props;

    // build label
    if (jqLite.type(label) === 'string') {
      let style = dropup ? {transform: 'rotate(180deg)'} : {};
      labelEl = <span>{label} <Caret style={style} /></span>;
    } else {
      labelEl = label;
    }

    buttonEl = (
      <Button
        ref={el => { this.buttonElRef = el }}
        type="button"
        onClick={this.onClickCB}
        color={color}
        variant={variant}
        size={size}
        disabled={disabled}
      >
        {labelEl}
      </Button>
    );

    if (this.state.opened) {
      let cs = {},
          style = {};

      cs[menuClass] = true;
      cs[menuRightClass] = (alignMenu === 'right');
      cs[menuUpClass] = (dropup === true),
      cs[openClass] = this.state.opened;
      cs = util.classNames(cs);

      // set menu position up/down
      style[dropup ? 'bottom' : 'top'] = this.state.menuTop;

      menuEl = (
        <ul
          ref={el => { this.menuElRef = el }}
          className={cs}
          style={style}
          onClick={this.selectCB}
        >
          {children}
        </ul>
      );
    } else {
      menuEl = <div></div>;
    }

    return (
      <div
        { ...reactProps }
        ref={el => { this.wrapperElRef = el }}
        className={dropdownClass + ' ' + className}
      >
        {buttonEl}
        {menuEl}
      </div>
    );
  }
}


/** Define module API */
export default Dropdown;

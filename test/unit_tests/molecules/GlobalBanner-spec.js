'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const sinon = require( 'sinon' );
const StorageMock = require( '../fixtures/StorageMock' );

const BASE_JS_PATH = '../../../cfgov/unprocessed/js/';
let globalBanner;
let clickEvent;
let contentDom;
let contentAnimatedDom;
let GlobalBanner;
let targetDom;
let toggleStoredStateSpy;
let webStorageProxy;

const HTML_SNIPPET =
  `<div class="m-global-banner">
    <div class="wrapper
                wrapper__match-content
                o-expandable
                o-expandable__expanded">
        <div class="m-global-banner_head">
            <span class="cf-icon
                         cf-icon-error-round
                         m-global-banner_icon"></span>
            This beta site is a work in progress.
        </div>
        <div class="o-expandable_content"
              aria-expanded="true" style="height: 22px;">
            <p class="m-global-banner_desc
                      o-expandable_content-animated">
                We’re prototyping new designs.
                Things may not work as expected.
                Our regular site continues to be at
                <a href="http://www.consumerfinance.gov/">
                    www.consumerfinance.gov</a>.
            </p>
        </div>
        <button class="a-btn
                       m-global-banner_btn
                       o-expandable_target
                       o-expandable_link"
                id="m-global-banner_btn"
                aria-pressed="true">
            <span class="o-expandable_cue o-expandable_cue-close">
                Collapse <span class="cf-icon cf-icon-up"></span>
            </span>
            <span class="o-expandable_cue o-expandable_cue-open">
                More info <span class="cf-icon cf-icon-down"></span>
            </span>
        </button>
    </div>
  </div>`;

// TODO: Refactor to remove the expandable from the global banner.
describe( 'Global Banner State', () => {

  before( () => {
    webStorageProxy =
      require( BASE_JS_PATH + 'modules/util/web-storage-proxy.js' );
  } );

  beforeEach( () => {
    this.jsdom = require( 'jsdom-global' )( HTML_SNIPPET );
    document = window.document;
    contentDom = document.querySelector( '.o-expandable_content' );
    contentAnimatedDom =
      document.querySelector( '.o-expandable_content-animated' );
    // TODO: remove the need for the line below as this is a read-only property.
    //contentAnimatedDom.offsetHeight = 300;
    targetDom = document.querySelector( '.o-expandable_target' );

    clickEvent = document.createEvent( 'Event' );
    clickEvent.initEvent( 'click', true, true );

    GlobalBanner = require( BASE_JS_PATH + 'molecules/GlobalBanner' );
    globalBanner =
      new GlobalBanner( document.querySelector( '.m-global-banner' ) );

    window.localStorage = new StorageMock();
    window.sessionStorage = new StorageMock();

    toggleStoredStateSpy = sinon.spy( globalBanner, 'toggleStoredState' );
  } );

  afterEach( () => {
    // Removed spy from method.
    globalBanner.toggleStoredState.restore();
    this.jsdom();
  } );

  describe( 'init', () => {
    it( 'should have instantiated an Expandable instance', () => {
      globalBanner.init();
      const isExpandable = contentDom.hasAttribute( 'style' );
      expect( isExpandable ).to.be.true;
    } );

    xit( 'should have called the initEvents function', () => {
      globalBanner.init();
      targetDom.dispatchEvent( clickEvent );

      return new Promise((resolve, reject) => window.setTimeout( function() {
        try {
          expect( toggleStoredStateSpy.called ).to.be.true;
          resolve();
        } catch( err ) {
          reject( err );
        }
      }, 0));
    } );
  } );

  describe( 'toggleStoredState', () => {
    it( 'should set the localStorage state to collasped', () => {
      expect( webStorageProxy.getItem( 'globalBannerIsExpanded' ) )
       .to.be.undefined;
      globalBanner.init();
      globalBanner.toggleStoredState();
      const isSet = webStorageProxy.getItem( 'globalBannerIsExpanded' );
      expect( isSet ).to.equal( 'false' );
    } );

    it( 'should set the localStorage state to expanded', () => {
      expect( webStorageProxy.getItem( 'globalBannerIsExpanded' ) )
        .to.be.undefined;
      globalBanner.init();
      globalBanner.toggleStoredState();
      globalBanner.toggleStoredState();
      const isSet = webStorageProxy.getItem( 'globalBannerIsExpanded' );
      expect( isSet ).to.equal( 'true' );
    } );
  } );

  describe( 'destroy', () => {
    xit( 'should remove event handlers and local storage data', () => {
      globalBanner.init();
      globalBanner.toggleStoredState();
      let isSet = webStorageProxy.getItem( 'globalBannerIsExpanded' );
      expect( isSet ).to.equal( 'false' );
      globalBanner.destroy();
      isSet = webStorageProxy.getItem( 'globalBannerIsExpanded' );
      expect( isSet ).to.be.undefined;

      targetDom.dispatchEvent( clickEvent );

      return new Promise((resolve, reject) => window.setTimeout( () => {
        try {
          expect( toggleStoredStateSpy.called ).to.be.false;
          resolve();
        } catch( err ) {
          reject( err );
        }
      }, 0));
    } );
  } );

} );

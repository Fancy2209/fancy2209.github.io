const KONSTRUCT_RELEASE_PATH = 'https://konstruct.kongregate.com/releases/0.1.2';
const KONSTRUCT_ASSETS_PATH = 'https://konstruct.kongregate.com/releases/0.1.2/assets';
var Konstruct = (function (exports) {
  'use strict';

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise, SuppressedError, Symbol */


  function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
  }

  function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
  }

  class FocusController {
      constructor(host, ref) {
          this.focused = false;
          this.handleBlur = () => {
              this.focused = false;
              this.host.requestUpdate();
          };
          this.handleFocus = () => {
              this.focused = true;
              this.host.requestUpdate();
          };
          this.host = host;
          this.host.addController(this);
          this.ref = ref;
      }
      hostUpdated() {
          if (!this.ref || this.ref.value === this.element) {
              return;
          }
          this.element = this.ref.value;
          this.element?.addEventListener('blur', this.handleBlur);
          this.element?.addEventListener('focus', this.handleFocus);
      }
      hostDisconnected() {
          this.element?.removeEventListener('blur', this.handleBlur);
          this.element?.removeEventListener('focus', this.handleFocus);
      }
  }

  /**
   * A controller that adds font tags to the `document.head` and the `host` element's `shadowRoot`.
   * This allows for using the font in the `host` element's template.
   *
   * @example
   * ```ts
   * import { FontController } from '@kongregate/konstruct-font-controller';
   * import { LitElement, html } from 'lit';
   * import { state } from '@kongregate/konstruct-decorators';
   *
   * import type { FontControllerHost } from '@kongregate/konstruct-font-controller';
   *
   * export class MyElement extends LitElement implements FontControllerHost {
   *   static SERIF_FONT_URL = 'https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap';
   *   static SANS_SERIF_FONT_URL = 'https://fonts.googleapis.com/css2?family=Roboto&display=swap';
   *
   *   static styles = css`
   *     :host([serif]) {
   *       font-family: 'Roboto Slab', serif;
   *     }
   *
   *     :host(:not([serif])) {
   *       font-family: 'Roboto', sans-serif;
   *     }
   *   `;
   *
   *   @property({ type: Boolean }) serif = false;
   *
   *   // Making `fonts` a reactive property allows the controller to add font tags and trigger an update
   *   // on the `host` element whenever the map is updated.
   *   @state() fonts: string[] = [];
   *
   *   // The host does not need to directly call `this.addController` on the controller as it is
   *   // added to the host in the controller's constructor.
   *   private fontsController: FontController<this> = new FontController(this);
   *
   *   firstUpdated() {
   *      this.loadFont();
   *   }
   *
   *   updated(changedProperties: Map<string, unknown>) {
   *     if (changedProperties.has('serif')) {
   *       this.loadFont();
   *     }
   *   }
   *
   *   private loadFont() {
   *     if (this.serif) {
   *      this.fontsController.loadFont(MyElement.SERIF_FONT_URL);
   *     } else {
   *       this.fontsController.loadFont(MyElement.SANS_SERIF_FONT_URL);
   *     }
   *   }
   *
   *   render() {
   *     return html`<slot></slot>`;
   *   }
   * }
   * ```
   */
  class FontController {
      constructor(host) {
          this.fonts = [];
          this.host = host;
          this.fonts = host.fonts;
          /**
           * Adds this controller to the `host` element. Allows for the `host` element to
           * omit adding this controller directly using `addController`.
           */
          this.host.addController(this);
      }
      /**
       * Called before the `host`'s `update()` and `render()` methods.
       * https://lit.dev/docs/v3/composition/controllers/#lifecycle
       */
      hostUpdated() {
          this.host.fonts.forEach((font) => {
              if (!this.fontAdded(font)) {
                  this.loadFont(font);
              }
          });
      }
      /**
       * Adds a font to the `host` element's `fonts` array. If the `host` element is connected, and if the
       * `fonts` property on the `host` element is a reactive property, it will trigger
       * `this.hostUpdated`, which will call `this.addFontTags`. This chain ultimately
       * adds the font tag to the `document.head` and the `host` element's `shadowRoot`,
       * allowing for using the font in the `host` element's template. If `fonts` is not
       * a reactive property, fonts will only be loaded on initial connection and on any
       * subsequent unrelated updates.
       *
       * @param font The URL of the font to load.
       */
      loadFont(font) {
          if (this.fontAdded(font)) {
              console.warn('Font already loaded:', font);
              return;
          }
          this.fonts.push(font);
          this.addFonts();
      }
      /**
       * Calls `this.addFontTag` for each font in the `host` element's `fonts` array.
       */
      addFonts() {
          this.fonts.forEach((font) => {
              switch (typeof font) {
                  case 'string':
                      this.loadFontFromString(font, document.head);
                      this.loadFontFromString(font, this.host.shadowRoot);
                      break;
                  case 'object':
                  default:
                      this.loadFontFromConfig(font);
                      break;
              }
          });
      }
      fontAdded(font) {
          return this.fonts.includes(font);
      }
      async loadFontFromConfig(font) {
          /**
           * Will return true if the font is already loaded in the document.
           *
           * @see https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/check
           */
          if (document.fonts.check(`12px "${font.family}"`)) {
              return;
          }
          await font.load();
          /**
           * Type coercing to make sure `add` is part of document.fonts.
           * It should always be in all browsers.
           *
           * @see https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/add
           */
          if ('add' in document.fonts && typeof document.fonts.add === 'function') {
              document.fonts.add?.(font);
          }
      }
      loadFontFromString(font, el) {
          if (!el || el?.querySelector(this.makeFontTagSelector(font))) {
              return;
          }
          const a = document.createElement('link');
          a.rel = 'stylesheet';
          a.href = font;
          el.prepend(a);
      }
      /**
       * Creates a selector for the font tag for the given `url`.
       *
       * @param url is the URL of the font.
       */
      makeFontTagSelector(url) {
          return `link[rel="stylesheet"][href="${url}"]`;
      }
  }

  /**
   * A reactive controller that determines when slots exist.
   */
  class HasSlotController {
      constructor(host, ...slotNames) {
          this.slotNames = [];
          (this.host = host).addController(this);
          this.slotNames = slotNames;
          this.handleSlotChange = this.handleSlotChange.bind(this);
      }
      test(slotName) {
          return slotName === '[default]'
              ? this.hasDefaultSlot()
              : this.hasNamedSlot(slotName);
      }
      hostConnected() {
          this.host.shadowRoot.addEventListener('slotchange', this.handleSlotChange);
      }
      hostDisconnected() {
          this.host.shadowRoot.removeEventListener('slotchange', this.handleSlotChange);
      }
      handleSlotChange(event) {
          const slot = event.target;
          if ((this.slotNames.includes('[default]') && !slot.name) ||
              (slot.name && this.slotNames.includes(slot.name))) {
              this.host.requestUpdate();
          }
      }
      hasDefaultSlot() {
          return Array.from(this.host.childNodes).some((node) => {
              if (node.nodeType === node.TEXT_NODE && node.textContent.trim() !== '') {
                  return true;
              }
              if (node.nodeType === node.ELEMENT_NODE) {
                  const el = node;
                  const tagName = el.tagName.toLowerCase();
                  // Ignore visually hidden elements since they aren't rendered
                  if (tagName === 'sr-only') {
                      return false;
                  }
                  // If it doesn't have a slot attribute, it's part of the default slot
                  if (!el.hasAttribute('slot')) {
                      return true;
                  }
              }
              return false;
          });
      }
      hasNamedSlot(name) {
          return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
      }
  }

  class HoverController {
      constructor(host, ref) {
          this.hovered = false;
          this.handleMouseOut = () => {
              this.hovered = false;
              this.host.requestUpdate();
          };
          this.handleMouseOver = () => {
              this.hovered = true;
              this.host.requestUpdate();
          };
          this.host = host;
          this.host.addController(this);
          this.ref = ref;
      }
      hostUpdated() {
          if (this.ref.value === this.element) {
              return;
          }
          this.element = this.ref.value;
          this.element?.addEventListener('mouseout', this.handleMouseOut);
          this.element?.addEventListener('mouseover', this.handleMouseOver);
      }
      hostDisconnected() {
          this.element?.removeEventListener('mouseout', this.handleMouseOut);
          this.element?.removeEventListener('mouseover', this.handleMouseOver);
      }
  }

  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t$3=window,e$9=t$3.ShadowRoot&&(void 0===t$3.ShadyCSS||t$3.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$7=Symbol(),n$a=new WeakMap;let o$a = class o{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$7)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$9&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$a.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$a.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new o$a("string"==typeof t?t:t+"",void 0,s$7),i$6=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$a(n,t,s$7)},S$1=(s,n)=>{e$9?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t$3.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$2=e$9?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var s$6;const e$8=window,r$3=e$8.trustedTypes,h$4=r$3?r$3.emptyScript:"",o$9=e$8.reactiveElementPolyfillSupport,n$9={toAttribute(t,i){switch(i){case Boolean:t=t?h$4:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$3=(t,i)=>i!==t&&(i==i||t==t),l$7={attribute:!0,type:String,converter:n$9,reflect:!1,hasChanged:a$3},d$1="finalized";let u$1 = class u extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$7){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$7}static finalize(){if(this.hasOwnProperty(d$1))return !1;this[d$1]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$2(i));}else void 0!==i&&s.push(c$2(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$7){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$9).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$9;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$3)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}};u$1[d$1]=!0,u$1.elementProperties=new Map,u$1.elementStyles=[],u$1.shadowRootOptions={mode:"open"},null==o$9||o$9({ReactiveElement:u$1}),(null!==(s$6=e$8.reactiveElementVersions)&&void 0!==s$6?s$6:e$8.reactiveElementVersions=[]).push("1.6.3");

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const s$5=Symbol();let h$3 = class h{constructor(t,i,s){var h,e,o;this.t=0,this.status=0,(this.i=t).addController(this);const n="object"==typeof i?i:{task:i,args:s};this.o=n.task,this.l=n.args,this.h=null!==(h=n.argsEqual)&&void 0!==h?h:r$2,this.u=n.onComplete,this.v=n.onError,this.autoRun=null===(e=n.autoRun)||void 0===e||e,"initialValue"in n&&(this.p=n.initialValue,this.status=2,this._=null===(o=this.j)||void 0===o?void 0:o.call(this));}get taskComplete(){return this.m||(1===this.status?this.m=new Promise(((t,i)=>{this.g=t,this.k=i;})):3===this.status?this.m=Promise.reject(this.A):this.m=Promise.resolve(this.p)),this.m}hostUpdate(){!0===this.autoRun&&this.O();}hostUpdated(){"afterUpdate"===this.autoRun&&this.O();}j(){if(void 0===this.l)return;const t=this.l();if(!Array.isArray(t))throw Error("The args function must return an array");return t}async O(){const t=this.j(),i=this._;this._=t,t===i||void 0===t||void 0!==i&&this.h(i,t)||await this.run(t);}async run(t){var i,h,r,e,o;let n,l;null!=t||(t=this.j()),this._=t,1===this.status?null===(i=this.T)||void 0===i||i.abort():(this.m=void 0,this.g=void 0,this.k=void 0),this.status=1,"afterUpdate"===this.autoRun?queueMicrotask((()=>this.i.requestUpdate())):this.i.requestUpdate();const a=++this.t;this.T=new AbortController;let u=!1;try{n=await this.o(t,{signal:this.T.signal});}catch(t){u=!0,l=t;}if(this.t===a){if(n===s$5)this.status=0;else {if(!1===u){try{null===(h=this.u)||void 0===h||h.call(this,n);}catch{}this.status=2,null===(r=this.g)||void 0===r||r.call(this,n);}else {try{null===(e=this.v)||void 0===e||e.call(this,l);}catch{}this.status=3,null===(o=this.k)||void 0===o||o.call(this,l);}this.p=n,this.A=l;}this.i.requestUpdate();}}abort(t){var i;1===this.status&&(null===(i=this.T)||void 0===i||i.abort(t));}get value(){return this.p}get error(){return this.A}render(t){var i,s,h,r;switch(this.status){case 0:return null===(i=t.initial)||void 0===i?void 0:i.call(t);case 1:return null===(s=t.pending)||void 0===s?void 0:s.call(t);case 2:return null===(h=t.complete)||void 0===h?void 0:h.call(t,this.value);case 3:return null===(r=t.error)||void 0===r?void 0:r.call(t,this.error);default:throw Error("Unexpected status: "+this.status)}}};const r$2=(i,s)=>i===s||i.length===s.length&&i.every(((i,h)=>!a$3(i,s[h])));

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  var t$2;const i$5=window,s$4=i$5.trustedTypes,e$7=s$4?s$4.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$8="$lit$",n$8=`lit$${(Math.random()+"").slice(9)}$`,l$6="?"+n$8,h$2=`<${l$6}>`,r$1=document,u=()=>r$1.createComment(""),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,c$1=Array.isArray,v=t=>c$1(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),a$2="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${a$2}(?:([^\\s"'>=/]+)(${a$2}*=${a$2}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,w=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=w(1),b=w(2),T=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),E=new WeakMap,C=r$1.createTreeWalker(r$1,129,null,!1);function P(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$7?e$7.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,e=[];let l,r=2===i?"<svg>":"",u=f;for(let i=0;i<s;i++){const s=t[i];let d,c,v=-1,a=0;for(;a<s.length&&(u.lastIndex=a,c=u.exec(s),null!==c);)a=u.lastIndex,u===f?"!--"===c[1]?u=_:void 0!==c[1]?u=m:void 0!==c[2]?(y.test(c[2])&&(l=RegExp("</"+c[2],"g")),u=p):void 0!==c[3]&&(u=p):u===p?">"===c[0]?(u=null!=l?l:f,v=-1):void 0===c[1]?v=-2:(v=u.lastIndex-c[2].length,d=c[1],u=void 0===c[3]?p:'"'===c[3]?$:g):u===$||u===g?u=p:u===_||u===m?u=f:(u=p,l=void 0);const w=u===p&&t[i+1].startsWith("/>")?" ":"";r+=u===f?s+h$2:v>=0?(e.push(d),s.slice(0,v)+o$8+s.slice(v)+n$8+w):s+n$8+(-2===v?(e.push(void 0),i):w);}return [P(t,r+(t[s]||"<?>")+(2===i?"</svg>":"")),e]};class N{constructor({strings:t,_$litType$:i},e){let h;this.parts=[];let r=0,d=0;const c=t.length-1,v=this.parts,[a,f]=V(t,i);if(this.el=N.createElement(a,e),C.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(h=C.nextNode())&&v.length<c;){if(1===h.nodeType){if(h.hasAttributes()){const t=[];for(const i of h.getAttributeNames())if(i.endsWith(o$8)||i.startsWith(n$8)){const s=f[d++];if(t.push(i),void 0!==s){const t=h.getAttribute(s.toLowerCase()+o$8).split(n$8),i=/([.?@])?(.*)/.exec(s);v.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?H:"?"===i[1]?L:"@"===i[1]?z:k});}else v.push({type:6,index:r});}for(const i of t)h.removeAttribute(i);}if(y.test(h.tagName)){const t=h.textContent.split(n$8),i=t.length-1;if(i>0){h.textContent=s$4?s$4.emptyScript:"";for(let s=0;s<i;s++)h.append(t[s],u()),C.nextNode(),v.push({type:2,index:++r});h.append(t[i],u());}}}else if(8===h.nodeType)if(h.data===l$6)v.push({type:2,index:r});else {let t=-1;for(;-1!==(t=h.data.indexOf(n$8,t+1));)v.push({type:7,index:r}),t+=n$8.length-1;}r++;}}static createElement(t,i){const s=r$1.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){var o,n,l,h;if(i===T)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=S(t,r._$AS(t,i.values),r,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:r$1).importNode(s,!0);C.currentNode=o;let n=C.nextNode(),l=0,h=0,u=e[0];for(;void 0!==u;){if(l===u.index){let i;2===u.type?i=new R(n,n.nextSibling,this,t):1===u.type?i=new u.ctor(n,u.name,u.strings,this,t):6===u.type&&(i=new Z(n,this,t)),this._$AV.push(i),u=e[++h];}l!==(null==u?void 0:u.index)&&(n=C.nextNode(),l++);}return C.currentNode=r$1,o}v(t){let i=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{constructor(t,i,s,e){var o;this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cp=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===(null==t?void 0:t.nodeType)&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),d(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):v(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==A&&d(this._$AH)?this._$AA.nextSibling.data=t:this.$(r$1.createTextNode(t)),this._$AH=t;}g(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=N.createElement(P(e.h,e.h[0]),this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.v(s);else {const t=new M(o,this),i=t.u(this.options);t.v(s),this.$(i),this._$AH=t;}}_$AC(t){let i=E.get(t.strings);return void 0===i&&E.set(t.strings,i=new N(t)),i}T(t){c$1(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new R(this.k(u()),this.k(u()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cp=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class k{constructor(t,i,s,e,o){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=S(this,t,i,0),n=!d(t)||t!==this._$AH&&t!==T,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=S(this,e[s+l],i,l),h===T&&(h=this._$AH[l]),n||(n=!d(h)||h!==this._$AH[l]),h===A?t=A:t!==A&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}const I=s$4?s$4.emptyScript:"";class L extends k{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==A?this.element.setAttribute(this.name,I):this.element.removeAttribute(this.name);}}class z extends k{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=S(this,t,i,0))&&void 0!==s?s:A)===T)return;const e=this._$AH,o=t===A&&e!==A||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A&&(e===A||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const B=i$5.litHtmlPolyfillSupport;null==B||B(N,R),(null!==(t$2=i$5.litHtmlVersions)&&void 0!==t$2?t$2:i$5.litHtmlVersions=[]).push("2.8.0");const D=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new R(i.insertBefore(u(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var l$5,o$7;let s$3 = class s extends u$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return T}};s$3.finalized=!0,s$3._$litElement$=!0,null===(l$5=globalThis.litElementHydrateSupport)||void 0===l$5||l$5.call(globalThis,{LitElement:s$3});const n$7=globalThis.litElementPolyfillSupport;null==n$7||n$7({LitElement:s$3});(null!==(o$7=globalThis.litElementVersions)&&void 0!==o$7?o$7:globalThis.litElementVersions=[]).push("3.3.3");

  class SVGController {
      static { this.parser = new DOMParser(); }
      constructor(host, src, config = {}) {
          this.host = host;
          this._src = src;
          this._config = {
              ...config,
              mode: config.mode ?? 'cors',
          };
          this._task = new h$3(this.host, this.resolveSrc, () => [
              this._src,
              this._config,
          ]);
          this.host.addController(this);
      }
      get config() {
          return this._config;
      }
      set config(config) {
          this._config = {
              ...this._config,
              ...config,
          };
      }
      set mode(mode) {
          this._config.mode = mode;
          this.host.requestUpdate();
      }
      set mutator(mutator) {
          this._config.mutator = mutator;
          this.host.requestUpdate();
      }
      get src() {
          return this._src;
      }
      set src(src) {
          this._src = src;
          this.host.requestUpdate();
      }
      get status() {
          return this._task.status;
      }
      render({ complete, error, ...renderFns } = {}) {
          return this._task.render({
              ...renderFns,
              /**
               * By default, on complete, return the SVGElement wrapped in an
               * `svg` template literal.
               */
              complete: (result) => {
                  if (this.config.class) {
                      result.classList.add(this.config.class);
                  }
                  if (this.config.mutator) {
                      this.config.mutator(result);
                  }
                  return complete?.(result) ?? b `${result}`;
              },
              /** By default, on error, return `nothing`. */
              error: error ?? (() => A),
          });
      }
      async resolveSrc([src, { mode, mutator: transformer }]) {
          if (!src) {
              throw new Error('SVGController requires a `src` to be set.');
          }
          if (!src.endsWith('.svg')) {
              throw new Error('SVGController only supports SVG files.');
          }
          return fetch(src, { mode }).then(async (response) => {
              if (!response.ok) {
                  throw new Error(`Could not fetch SVG from ${response.url}.`);
              }
              const parsed = SVGController.parser.parseFromString(await response.text(), 'image/svg+xml').documentElement;
              if (!(parsed instanceof SVGElement)) {
                  throw new Error(`Could not parse SVG from the response sent by ${response.url}.`);
              }
              transformer?.(parsed);
              return parsed;
          });
      }
  }

  class IconLibraryController {
      constructor(host, state) {
          this._host = host;
          this._state = state;
          this._icon = new SVGController(this._host, this.src, {
              mode: this.state.mode ?? 'cors',
              mutator: this.state.mutator,
          });
          this._host.addController(this);
      }
      get status() {
          return this._icon.status;
      }
      get iconName() {
          return typeof this.state.iconName === 'function'
              ? this.state.iconName()
              : this.state.iconName;
      }
      get library() {
          return this.state;
      }
      get src() {
          if (!this.iconName) {
              return undefined;
          }
          if ('path' in this.state) {
              return `${this.state.path}/${this.iconName}.svg`;
          }
          return this.state.resolver(this.iconName);
      }
      get state() {
          return typeof this._state === 'function' ? this._state() : this._state;
      }
      set state(state) {
          this._state = state;
      }
      hostUpdate() {
          if (this._icon.src !== this.src) {
              this._icon.src = this.src;
          }
      }
      render(renderFns = {}) {
          return this._icon.render(renderFns);
      }
  }

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const t$1={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},e$6=t=>(...e)=>({_$litDirective$:t,values:e});let i$4 = class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};

  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const e$5=o=>void 0===o.strings,s$2={},a$1=(o,l=s$2)=>o._$AH=l;

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const s$1=(i,t)=>{var e,o;const r=i._$AN;if(void 0===r)return !1;for(const i of r)null===(o=(e=i)._$AO)||void 0===o||o.call(e,t,!1),s$1(i,t);return !0},o$6=i=>{let t,e;do{if(void 0===(t=i._$AM))break;e=t._$AN,e.delete(i),i=t;}while(0===(null==e?void 0:e.size))},r=i=>{for(let t;t=i._$AM;i=t){let e=t._$AN;if(void 0===e)t._$AN=e=new Set;else if(e.has(i))break;e.add(i),l$4(t);}};function n$6(i){void 0!==this._$AN?(o$6(this),this._$AM=i,r(this)):this._$AM=i;}function h$1(i,t=!1,e=0){const r=this._$AH,n=this._$AN;if(void 0!==n&&0!==n.size)if(t)if(Array.isArray(r))for(let i=e;i<r.length;i++)s$1(r[i],!1),o$6(r[i]);else null!=r&&(s$1(r,!1),o$6(r));else s$1(this,i);}const l$4=i=>{var t,s,o,r;i.type==t$1.CHILD&&(null!==(t=(o=i)._$AP)&&void 0!==t||(o._$AP=h$1),null!==(s=(r=i)._$AQ)&&void 0!==s||(r._$AQ=n$6));};class c extends i$4{constructor(){super(...arguments),this._$AN=void 0;}_$AT(i,t,e){super._$AT(i,t,e),r(this),this.isConnected=i._$AU;}_$AO(i,t=!0){var e,r;i!==this.isConnected&&(this.isConnected=i,i?null===(e=this.reconnected)||void 0===e||e.call(this):null===(r=this.disconnected)||void 0===r||r.call(this)),t&&(s$1(this,i),o$6(this));}setValue(t){if(e$5(this._$Ct))this._$Ct._$AI(t,this);else {const i=[...this._$Ct._$AH];i[this._$Ci]=t,this._$Ct._$AI(i,this,0);}}disconnected(){}reconnected(){}}

  /**
   * Usage:
   *    import { html, render } from 'lit';
   *    import { spreadProps } from '@open-wc/lit-helpers';
   *
   *    render(
   *      html`
   *        <div
   *          ${spreadProps({
   *              prop1: 'prop1',
   *              prop2: ['Prop', '2'],
   *              prop3: {
   *                  prop: 3,
   *              }
   *          })}
   *        ></div>
   *      `,
   *      document.body,
   *    );
   */
  class SpreadPropsDirective extends c {
      constructor() {
          super(...arguments);
          this.prevData = {};
      }
      render(_spreadData) {
          return A;
      }
      update(part, [spreadData]) {
          var _a;
          if (this.element !== part.element) {
              this.element = part.element;
          }
          this.host = ((_a = part.options) === null || _a === void 0 ? void 0 : _a.host) || this.element;
          this.apply(spreadData);
          this.groom(spreadData);
          this.prevData = { ...spreadData };
      }
      apply(data) {
          if (!data)
              return;
          const { prevData, element } = this;
          for (const key in data) {
              const value = data[key];
              if (value === prevData[key]) {
                  continue;
              }
              // @ts-ignore
              element[key] = value;
          }
      }
      groom(data) {
          const { prevData, element } = this;
          if (!prevData)
              return;
          for (const key in prevData) {
              if (!data || (!(key in data) && element[key] === prevData[key])) {
                  // @ts-ignore
                  element[key] = undefined;
              }
          }
      }
  }
  /**
   * Usage:
   *    import { html, render } from 'lit';
   *    import { spreadEvents } from '@open-wc/lit-helpers';
   *
   *    render(
   *      html`
   *        <div
   *          ${spreadEvents({
   *            '@my-event': () => console.log('my-event fired'),
   *            '@my-other-event': () => console.log('my-other-event fired'),
   *            '@my-additional-event':
   *              () => console.log('my-additional-event fired'),
   *          })}
   *        ></div>
   *      `,
   *      document.body,
   *    );
   */
  class SpreadEventsDirective extends SpreadPropsDirective {
      constructor() {
          super(...arguments);
          this.eventData = {};
      }
      apply(data) {
          if (!data)
              return;
          for (const key in data) {
              const value = data[key];
              if (value === this.eventData[key]) {
                  // do nothing if the same value is being applied again.
                  continue;
              }
              this.applyEvent(key, value);
          }
      }
      applyEvent(eventName, eventValue) {
          const { prevData, element } = this;
          this.eventData[eventName] = eventValue;
          const prevHandler = prevData[eventName];
          if (prevHandler) {
              element.removeEventListener(eventName, this, eventValue);
          }
          element.addEventListener(eventName, this, eventValue);
      }
      groom(data) {
          const { prevData, element } = this;
          if (!prevData)
              return;
          for (const key in prevData) {
              if (!data || (!(key in data) && element[key] === prevData[key])) {
                  this.groomEvent(key, prevData[key]);
              }
          }
      }
      groomEvent(eventName, eventValue) {
          const { element } = this;
          delete this.eventData[eventName];
          element.removeEventListener(eventName, this, eventValue);
      }
      handleEvent(event) {
          const value = this.eventData[event.type];
          if (typeof value === 'function') {
              value.call(this.host, event);
          }
          else {
              value.handleEvent(event);
          }
      }
      disconnected() {
          const { eventData, element } = this;
          for (const key in eventData) {
              // event listener
              const name = key.slice(1);
              const value = eventData[key];
              element.removeEventListener(name, this, value);
          }
      }
      reconnected() {
          const { eventData, element } = this;
          for (const key in eventData) {
              // event listener
              const name = key.slice(1);
              const value = eventData[key];
              element.addEventListener(name, this, value);
          }
      }
  }
  /**
   * Usage:
   *    import { html, render } from 'lit';
   *    import { spread } from '@open-wc/lit-helpers';
   *
   *    render(
   *      html`
   *        <div
   *          ${spread({
   *            'my-attribute': 'foo',
   *            '?my-boolean-attribute': true,
   *            '.myProperty': { foo: 'bar' },
   *            '@my-event': () => console.log('my-event fired'),
   *          })}
   *        ></div>
   *      `,
   *      document.body,
   *    );
   */
  class SpreadDirective extends SpreadEventsDirective {
      apply(data) {
          if (!data)
              return;
          const { prevData, element } = this;
          for (const key in data) {
              const value = data[key];
              if (value === prevData[key]) {
                  continue;
              }
              const name = key.slice(1);
              switch (key[0]) {
                  case '@': // event listener
                      this.eventData[name] = value;
                      this.applyEvent(name, value);
                      break;
                  case '.': // property
                      // @ts-ignore
                      element[name] = value;
                      break;
                  case '?': // boolean attribute
                      if (value) {
                          element.setAttribute(name, '');
                      }
                      else {
                          element.removeAttribute(name);
                      }
                      break;
                  default:
                      // standard attribute
                      if (value != null) {
                          element.setAttribute(key, String(value));
                      }
                      else {
                          element.removeAttribute(key);
                      }
                      break;
              }
          }
      }
      groom(data) {
          const { prevData, element } = this;
          if (!prevData)
              return;
          for (const key in prevData) {
              const name = key.slice(1);
              if (!data || (!(key in data) && element[name] === prevData[key])) {
                  switch (key[0]) {
                      case '@': // event listener
                          this.groomEvent(name, prevData[key]);
                          break;
                      case '.': // property
                          // @ts-ignore
                          element[name] = undefined;
                          break;
                      case '?': // boolean attribute
                          element.removeAttribute(name);
                          break;
                      default:
                          // standard attribute
                          element.removeAttribute(key);
                          break;
                  }
              }
          }
      }
  }
  const spread = e$6(SpreadDirective);

  class ImageController {
      constructor(host, config) {
          this._config = {
              ...config,
              mode: config.mode ?? 'cors',
          };
          this._host = host;
          this._src = config.src;
          this._task = new h$3(this._host, this.resolveSrc, () => [
              this.src,
              this._config,
          ]);
      }
      set config(config) {
          this._config = {
              ...this._config,
              ...config,
          };
      }
      get mode() {
          return this._config.mode ?? 'cors';
      }
      set mode(mode) {
          this._config.mode = mode;
          this._host.requestUpdate();
      }
      get src() {
          return this._src;
      }
      set src(src) {
          this._src = src;
          this._host.requestUpdate();
      }
      get status() {
          return this._task.status;
      }
      render({ complete, error, ...renderFns } = {}) {
          return this._task.render({
              ...renderFns,
              complete: complete
                  ? complete
                  : (src) => {
                      return x `<img alt="${this._config.alt}" src="${src}" ${spread(this._config.attributes ?? {})}>`;
                  },
              error: error
                  ? error
                  : () => {
                      if (!this._config.fallback) {
                          return A;
                      }
                      return x `<img alt="${this._config.fallbackAlt ?? this._config.alt}" src="${this._config.fallback}" ${spread(this._config.attributes ?? {})}>`;
                  },
          });
      }
      async resolveSrc([src, { mode }]) {
          if (!src) {
              throw Error('ImageController requires a `src` to be set.');
          }
          return fetch(src, { mode: mode })
              .then(async (response) => {
              if (!response.ok) {
                  throw Error(`Could not resolve image from ${response.url}.`);
              }
              return src;
          })
              .catch((err) => {
              console.error(err);
              throw err;
          });
      }
  }

  class JSONController {
      constructor(host, config) {
          this._host = host;
          this._config = {
              ...config,
              mode: config.mode ?? 'cors',
          };
          this._task = new h$3(this._host, this.resolveSrc, () => [this._config]);
      }
      get config() {
          return this._config;
      }
      set config(config) {
          this._config = { ...this._config, ...config };
      }
      render(renderFns) {
          return this._task.render(renderFns);
      }
      async resolveSrc([{ mode = 'cors', skip, src, transformer }]) {
          if (skip) {
              return null;
          }
          if (!src) {
              throw new Error('JSONController requires a `src` to be set.');
          }
          if (!src.endsWith('.json')) {
              throw new Error('JSONController only supports JSON files.');
          }
          return fetch(src, { cache: 'default', mode }).then(async (response) => {
              if (!response.ok) {
                  throw new Error(`Could not fetch JSON from ${response.url}.`);
              }
              const parsed = await response.json();
              return transformer?.(parsed) ?? parsed;
          });
      }
  }

  class ResponsiveController {
      static { this.TIMEOUT_LENGTH = 200; }
      /** If not overridden, these will be the breakpoints used for responsive mode. */
      static { this.DEFAULT_BREAKPOINTS = {
          desktop: 1024,
          tablet: 768,
      }; }
      constructor(host) {
          this._timeout = null;
          this._host = host;
          this.setBreakpoints();
          this.setStatic();
          this.setHostView = this.setHostView.bind(this);
      }
      get defaultBreakpoints() {
          return ResponsiveController.DEFAULT_BREAKPOINTS;
      }
      hostDisconnected() {
          window.removeEventListener('resize', this.setHostView);
      }
      hostUpdate() {
          this._breakpoints = this._host.breakpoints ?? this.defaultBreakpoints;
          this._static = this._host.static ?? false;
          if (this._static) {
              window.removeEventListener('resize', this.setHostView);
              return;
          }
          window.addEventListener('resize', this.setHostView);
          this.setHostView();
      }
      setHostView() {
          if (this._timeout) {
              clearTimeout(this._timeout);
          }
          this._timeout = setTimeout(() => {
              const width = window.innerWidth;
              let view;
              if (width >= this._breakpoints.desktop) {
                  view = 'desktop';
              }
              else if (this._breakpoints.tablet &&
                  width >= this._breakpoints.tablet) {
                  view = 'tablet';
              }
              else {
                  view = 'mobile';
              }
              if (this._host.view !== view) {
                  this._host.view = view;
              }
          }, ResponsiveController.TIMEOUT_LENGTH);
      }
      setBreakpoints() {
          this._breakpoints = this._host.breakpoints ?? this.defaultBreakpoints;
      }
      setStatic() {
          this._static = this._host.static ?? false;
      }
  }

  /**
   * A controller that can be used to manage a slot element.
   *
   * @see https://lit.dev/docs/components/controllers/
   */
  class SlotController {
      constructor(host, config) {
          this.host = host;
          this.config = config;
      }
      get slotted() {
          return this.slots.reduce((acc, slot) => {
              const slotted = Array.from(slot.assignedElements());
              return [...acc, ...slotted];
          }, []);
      }
      get slots() {
          const { shadowRoot } = this.host;
          if (!shadowRoot) {
              return [];
          }
          /**
           * If the `slots` config value is `all`, we'll return all slots in the
           * shadow root.
           */
          if (this.config.slots === 'all') {
              return Array.from(shadowRoot.querySelectorAll('slot') ?? []).filter(this.isSlotElement);
          }
          /**
           * If the `slots` config value is `default`, we'll return the default slot
           * in the shadow root.
           */
          if (this.config.slots === 'default') {
              return [shadowRoot.querySelector('slot:not([name])')].filter(this.isSlotElement);
          }
          /**
           * If the `slots` config value is an array of strings, we'll return all
           * slots in the shadow root that match the names in the array.
           */
          return this.config.slots
              .map((name) => shadowRoot.querySelector(`slot[name="${name}"]`))
              .filter(this.isSlotElement);
      }
      isSlotElement(el) {
          return el instanceof HTMLSlotElement;
      }
      /**
       * Will be called whenever the host element is updated.
       *
       * @see https://lit.dev/docs/composition/controllers/
       */
      hostUpdated() {
          this.addSlotChangeListeners();
          this.filterSlottable();
          this.updateSlots();
      }
      /**
       * This ensures that when the content of a slot changes without an update
       * being called on the host element, the slots will still be updated.
       */
      addSlotChangeListeners() {
          this.slots.forEach((slot) => {
              slot.removeEventListener('slotchange', this.updateSlots.bind(this));
              slot.addEventListener('slotchange', this.updateSlots.bind(this));
          });
      }
      updateSlots() {
          this.forwardAttrs();
          this.setSlottableAttrs();
      }
      /**
       * Sets attributes on slotted elements based on the `forwardAttrs` config
       * value.
       */
      forwardAttrs() {
          this.config.forwardAttrs?.forEach((attr) => {
              const value = this.host.getAttribute(attr);
              this.slotted.forEach((el) => {
                  if (el.getAttribute(attr)) ;
                  if (value) {
                      el.setAttribute(attr, value);
                  }
                  else {
                      el.removeAttribute(attr);
                  }
              });
          });
      }
      /** Sets attributes on slotted elements based on the `setAttrs` config value. */
      setSlottableAttrs() {
          this.slotted.forEach((el) => {
              const attrs = Object.entries({
                  ...(typeof this.config.setAttrs === 'function'
                      ? this.config.setAttrs(el)
                      : this.config.setAttrs),
              });
              attrs.forEach(([attr, value]) => {
                  const valueToSet = typeof value === 'function' ? value() : value;
                  if (el.getAttribute(attr)) ;
                  if (valueToSet) {
                      el.setAttribute(attr, String(valueToSet));
                  }
                  else {
                      el.removeAttribute(attr);
                  }
              });
          });
      }
      /**
       * Checks if an element is allowed to be slotted. If no `allowedElements` are
       * provided in the config, all elements are allowed.
       *
       * @param el Is the element to check.
       */
      isSlottable(el) {
          const allowedElements = this.config.allow;
          if (!allowedElements) {
              return true;
          }
          return Boolean(allowedElements?.find((El) => el instanceof El));
      }
      /**
       * Filters out any slotted elements that are not allowed to be slotted.
       * Elements that are not allowed to be slotted will be removed from the DOM
       * automatically.
       */
      filterSlottable() {
          this.slotted.forEach((el, index) => {
              if (!this.isSlottable(el)) {
                  // console.warn(
                  //   `Invalid slotted element: ${el.tagName}. It will be removed.`,
                  //   `Only the following elements are allowed: ${this.config.allow
                  //     ?.map((El) => El.name)
                  //     .join(', ')}`,
                  // );
                  el.remove();
              }
              if (this.config.limit && index >= this.config.limit) {
                  el.remove();
              }
          });
      }
  }

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const e$4=e=>n=>"function"==typeof n?((e,n)=>(customElements.define(e,n),n))(e,n):((e,n)=>{const{kind:t,elements:s}=n;return {kind:t,elements:s,finisher(n){customElements.define(e,n);}}})(e,n);

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const i$3=(i,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(n){n.createProperty(e.key,i);}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this));},finisher(n){n.createProperty(e.key,i);}},e$3=(i,e,n)=>{e.constructor.createProperty(n,i);};function n$5(n){return (t,o)=>void 0!==o?e$3(n,t,o):i$3(n,t)}

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */function t(t){return n$5({...t,state:!0})}

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const o$5=({finisher:e,descriptor:t})=>(o,n)=>{var r;if(void 0===n){const n=null!==(r=o.originalKey)&&void 0!==r?r:o.key,i=null!=t?{kind:"method",placement:"prototype",key:n,descriptor:t(o.key)}:{...o,key:n};return null!=e&&(i.finisher=function(t){e(t,n);}),i}{const r=o.constructor;void 0!==t&&Object.defineProperty(o,n,t(n)),null==e||e(r,n);}};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */function i$2(i,n){return o$5({descriptor:o=>{const t={get(){var o,n;return null!==(n=null===(o=this.renderRoot)||void 0===o?void 0:o.querySelector(i))&&void 0!==n?n:null},enumerable:!0,configurable:!0};if(n){const n="symbol"==typeof o?Symbol():"__"+o;t.get=function(){var o,t;return void 0===this[n]&&(this[n]=null!==(t=null===(o=this.renderRoot)||void 0===o?void 0:o.querySelector(i))&&void 0!==t?t:null),this[n]};}return t}})}

  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */var n$4;const e$2=null!=(null===(n$4=window.HTMLSlotElement)||void 0===n$4?void 0:n$4.prototype.assignedElements)?(o,n)=>o.assignedElements(n):(o,n)=>o.assignedNodes(n).filter((o=>o.nodeType===Node.ELEMENT_NODE));function l$3(n){const{slot:l,selector:t}=null!=n?n:{};return o$5({descriptor:o=>({get(){var o;const r="slot"+(l?`[name=${l}]`:":not([name])"),i=null===(o=this.renderRoot)||void 0===o?void 0:o.querySelector(r),s=null!=i?e$2(i,n):[];return t?s.filter((o=>o.matches(t))):s},enumerable:!0,configurable:!0})})}

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */function o$4(o,n,r){let l,s=o;return "object"==typeof o?(s=o.slot,l=o):l={flatten:n},r?l$3({slot:s,flatten:n,selector:r}):o$5({descriptor:e=>({get(){var e,t;const o="slot"+(s?`[name=${s}]`:":not([name])"),n=null===(e=this.renderRoot)||void 0===e?void 0:e.querySelector(o);return null!==(t=null==n?void 0:n.assignedNodes(l))&&void 0!==t?t:[]},enumerable:!0,configurable:!0})})}

  const dateConverter = (val) => {
      // If each character is a number
      if (/^\d+$/.test(val ?? '')) {
          return new Date(parseInt(val ?? '', 10));
      }
      const date = new Date(val ?? '');
      if (isNaN(date.getTime())) {
          return new Date();
      }
      return date;
  };
  const dateArrayConverter = (val) => {
      try {
          const parsed = JSON.parse(val ?? '');
          if (!Array.isArray(parsed)) {
              return [];
          }
          return parsed
              .map((date) => new Date(date))
              .filter((date) => !isNaN(date.getTime()));
      }
      catch (err) {
          console.error('Could not parse dates value', err);
      }
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var _mapping = {};

  /** Used to map aliases to their real names. */

  (function (exports) {
  	exports.aliasToReal = {

  	  // Lodash aliases.
  	  'each': 'forEach',
  	  'eachRight': 'forEachRight',
  	  'entries': 'toPairs',
  	  'entriesIn': 'toPairsIn',
  	  'extend': 'assignIn',
  	  'extendAll': 'assignInAll',
  	  'extendAllWith': 'assignInAllWith',
  	  'extendWith': 'assignInWith',
  	  'first': 'head',

  	  // Methods that are curried variants of others.
  	  'conforms': 'conformsTo',
  	  'matches': 'isMatch',
  	  'property': 'get',

  	  // Ramda aliases.
  	  '__': 'placeholder',
  	  'F': 'stubFalse',
  	  'T': 'stubTrue',
  	  'all': 'every',
  	  'allPass': 'overEvery',
  	  'always': 'constant',
  	  'any': 'some',
  	  'anyPass': 'overSome',
  	  'apply': 'spread',
  	  'assoc': 'set',
  	  'assocPath': 'set',
  	  'complement': 'negate',
  	  'compose': 'flowRight',
  	  'contains': 'includes',
  	  'dissoc': 'unset',
  	  'dissocPath': 'unset',
  	  'dropLast': 'dropRight',
  	  'dropLastWhile': 'dropRightWhile',
  	  'equals': 'isEqual',
  	  'identical': 'eq',
  	  'indexBy': 'keyBy',
  	  'init': 'initial',
  	  'invertObj': 'invert',
  	  'juxt': 'over',
  	  'omitAll': 'omit',
  	  'nAry': 'ary',
  	  'path': 'get',
  	  'pathEq': 'matchesProperty',
  	  'pathOr': 'getOr',
  	  'paths': 'at',
  	  'pickAll': 'pick',
  	  'pipe': 'flow',
  	  'pluck': 'map',
  	  'prop': 'get',
  	  'propEq': 'matchesProperty',
  	  'propOr': 'getOr',
  	  'props': 'at',
  	  'symmetricDifference': 'xor',
  	  'symmetricDifferenceBy': 'xorBy',
  	  'symmetricDifferenceWith': 'xorWith',
  	  'takeLast': 'takeRight',
  	  'takeLastWhile': 'takeRightWhile',
  	  'unapply': 'rest',
  	  'unnest': 'flatten',
  	  'useWith': 'overArgs',
  	  'where': 'conformsTo',
  	  'whereEq': 'isMatch',
  	  'zipObj': 'zipObject'
  	};

  	/** Used to map ary to method names. */
  	exports.aryMethod = {
  	  '1': [
  	    'assignAll', 'assignInAll', 'attempt', 'castArray', 'ceil', 'create',
  	    'curry', 'curryRight', 'defaultsAll', 'defaultsDeepAll', 'floor', 'flow',
  	    'flowRight', 'fromPairs', 'invert', 'iteratee', 'memoize', 'method', 'mergeAll',
  	    'methodOf', 'mixin', 'nthArg', 'over', 'overEvery', 'overSome','rest', 'reverse',
  	    'round', 'runInContext', 'spread', 'template', 'trim', 'trimEnd', 'trimStart',
  	    'uniqueId', 'words', 'zipAll'
  	  ],
  	  '2': [
  	    'add', 'after', 'ary', 'assign', 'assignAllWith', 'assignIn', 'assignInAllWith',
  	    'at', 'before', 'bind', 'bindAll', 'bindKey', 'chunk', 'cloneDeepWith',
  	    'cloneWith', 'concat', 'conformsTo', 'countBy', 'curryN', 'curryRightN',
  	    'debounce', 'defaults', 'defaultsDeep', 'defaultTo', 'delay', 'difference',
  	    'divide', 'drop', 'dropRight', 'dropRightWhile', 'dropWhile', 'endsWith', 'eq',
  	    'every', 'filter', 'find', 'findIndex', 'findKey', 'findLast', 'findLastIndex',
  	    'findLastKey', 'flatMap', 'flatMapDeep', 'flattenDepth', 'forEach',
  	    'forEachRight', 'forIn', 'forInRight', 'forOwn', 'forOwnRight', 'get',
  	    'groupBy', 'gt', 'gte', 'has', 'hasIn', 'includes', 'indexOf', 'intersection',
  	    'invertBy', 'invoke', 'invokeMap', 'isEqual', 'isMatch', 'join', 'keyBy',
  	    'lastIndexOf', 'lt', 'lte', 'map', 'mapKeys', 'mapValues', 'matchesProperty',
  	    'maxBy', 'meanBy', 'merge', 'mergeAllWith', 'minBy', 'multiply', 'nth', 'omit',
  	    'omitBy', 'overArgs', 'pad', 'padEnd', 'padStart', 'parseInt', 'partial',
  	    'partialRight', 'partition', 'pick', 'pickBy', 'propertyOf', 'pull', 'pullAll',
  	    'pullAt', 'random', 'range', 'rangeRight', 'rearg', 'reject', 'remove',
  	    'repeat', 'restFrom', 'result', 'sampleSize', 'some', 'sortBy', 'sortedIndex',
  	    'sortedIndexOf', 'sortedLastIndex', 'sortedLastIndexOf', 'sortedUniqBy',
  	    'split', 'spreadFrom', 'startsWith', 'subtract', 'sumBy', 'take', 'takeRight',
  	    'takeRightWhile', 'takeWhile', 'tap', 'throttle', 'thru', 'times', 'trimChars',
  	    'trimCharsEnd', 'trimCharsStart', 'truncate', 'union', 'uniqBy', 'uniqWith',
  	    'unset', 'unzipWith', 'without', 'wrap', 'xor', 'zip', 'zipObject',
  	    'zipObjectDeep'
  	  ],
  	  '3': [
  	    'assignInWith', 'assignWith', 'clamp', 'differenceBy', 'differenceWith',
  	    'findFrom', 'findIndexFrom', 'findLastFrom', 'findLastIndexFrom', 'getOr',
  	    'includesFrom', 'indexOfFrom', 'inRange', 'intersectionBy', 'intersectionWith',
  	    'invokeArgs', 'invokeArgsMap', 'isEqualWith', 'isMatchWith', 'flatMapDepth',
  	    'lastIndexOfFrom', 'mergeWith', 'orderBy', 'padChars', 'padCharsEnd',
  	    'padCharsStart', 'pullAllBy', 'pullAllWith', 'rangeStep', 'rangeStepRight',
  	    'reduce', 'reduceRight', 'replace', 'set', 'slice', 'sortedIndexBy',
  	    'sortedLastIndexBy', 'transform', 'unionBy', 'unionWith', 'update', 'xorBy',
  	    'xorWith', 'zipWith'
  	  ],
  	  '4': [
  	    'fill', 'setWith', 'updateWith'
  	  ]
  	};

  	/** Used to map ary to rearg configs. */
  	exports.aryRearg = {
  	  '2': [1, 0],
  	  '3': [2, 0, 1],
  	  '4': [3, 2, 0, 1]
  	};

  	/** Used to map method names to their iteratee ary. */
  	exports.iterateeAry = {
  	  'dropRightWhile': 1,
  	  'dropWhile': 1,
  	  'every': 1,
  	  'filter': 1,
  	  'find': 1,
  	  'findFrom': 1,
  	  'findIndex': 1,
  	  'findIndexFrom': 1,
  	  'findKey': 1,
  	  'findLast': 1,
  	  'findLastFrom': 1,
  	  'findLastIndex': 1,
  	  'findLastIndexFrom': 1,
  	  'findLastKey': 1,
  	  'flatMap': 1,
  	  'flatMapDeep': 1,
  	  'flatMapDepth': 1,
  	  'forEach': 1,
  	  'forEachRight': 1,
  	  'forIn': 1,
  	  'forInRight': 1,
  	  'forOwn': 1,
  	  'forOwnRight': 1,
  	  'map': 1,
  	  'mapKeys': 1,
  	  'mapValues': 1,
  	  'partition': 1,
  	  'reduce': 2,
  	  'reduceRight': 2,
  	  'reject': 1,
  	  'remove': 1,
  	  'some': 1,
  	  'takeRightWhile': 1,
  	  'takeWhile': 1,
  	  'times': 1,
  	  'transform': 2
  	};

  	/** Used to map method names to iteratee rearg configs. */
  	exports.iterateeRearg = {
  	  'mapKeys': [1],
  	  'reduceRight': [1, 0]
  	};

  	/** Used to map method names to rearg configs. */
  	exports.methodRearg = {
  	  'assignInAllWith': [1, 0],
  	  'assignInWith': [1, 2, 0],
  	  'assignAllWith': [1, 0],
  	  'assignWith': [1, 2, 0],
  	  'differenceBy': [1, 2, 0],
  	  'differenceWith': [1, 2, 0],
  	  'getOr': [2, 1, 0],
  	  'intersectionBy': [1, 2, 0],
  	  'intersectionWith': [1, 2, 0],
  	  'isEqualWith': [1, 2, 0],
  	  'isMatchWith': [2, 1, 0],
  	  'mergeAllWith': [1, 0],
  	  'mergeWith': [1, 2, 0],
  	  'padChars': [2, 1, 0],
  	  'padCharsEnd': [2, 1, 0],
  	  'padCharsStart': [2, 1, 0],
  	  'pullAllBy': [2, 1, 0],
  	  'pullAllWith': [2, 1, 0],
  	  'rangeStep': [1, 2, 0],
  	  'rangeStepRight': [1, 2, 0],
  	  'setWith': [3, 1, 2, 0],
  	  'sortedIndexBy': [2, 1, 0],
  	  'sortedLastIndexBy': [2, 1, 0],
  	  'unionBy': [1, 2, 0],
  	  'unionWith': [1, 2, 0],
  	  'updateWith': [3, 1, 2, 0],
  	  'xorBy': [1, 2, 0],
  	  'xorWith': [1, 2, 0],
  	  'zipWith': [1, 2, 0]
  	};

  	/** Used to map method names to spread configs. */
  	exports.methodSpread = {
  	  'assignAll': { 'start': 0 },
  	  'assignAllWith': { 'start': 0 },
  	  'assignInAll': { 'start': 0 },
  	  'assignInAllWith': { 'start': 0 },
  	  'defaultsAll': { 'start': 0 },
  	  'defaultsDeepAll': { 'start': 0 },
  	  'invokeArgs': { 'start': 2 },
  	  'invokeArgsMap': { 'start': 2 },
  	  'mergeAll': { 'start': 0 },
  	  'mergeAllWith': { 'start': 0 },
  	  'partial': { 'start': 1 },
  	  'partialRight': { 'start': 1 },
  	  'without': { 'start': 1 },
  	  'zipAll': { 'start': 0 }
  	};

  	/** Used to identify methods which mutate arrays or objects. */
  	exports.mutate = {
  	  'array': {
  	    'fill': true,
  	    'pull': true,
  	    'pullAll': true,
  	    'pullAllBy': true,
  	    'pullAllWith': true,
  	    'pullAt': true,
  	    'remove': true,
  	    'reverse': true
  	  },
  	  'object': {
  	    'assign': true,
  	    'assignAll': true,
  	    'assignAllWith': true,
  	    'assignIn': true,
  	    'assignInAll': true,
  	    'assignInAllWith': true,
  	    'assignInWith': true,
  	    'assignWith': true,
  	    'defaults': true,
  	    'defaultsAll': true,
  	    'defaultsDeep': true,
  	    'defaultsDeepAll': true,
  	    'merge': true,
  	    'mergeAll': true,
  	    'mergeAllWith': true,
  	    'mergeWith': true,
  	  },
  	  'set': {
  	    'set': true,
  	    'setWith': true,
  	    'unset': true,
  	    'update': true,
  	    'updateWith': true
  	  }
  	};

  	/** Used to map real names to their aliases. */
  	exports.realToAlias = (function() {
  	  var hasOwnProperty = Object.prototype.hasOwnProperty,
  	      object = exports.aliasToReal,
  	      result = {};

  	  for (var key in object) {
  	    var value = object[key];
  	    if (hasOwnProperty.call(result, value)) {
  	      result[value].push(key);
  	    } else {
  	      result[value] = [key];
  	    }
  	  }
  	  return result;
  	}());

  	/** Used to map method names to other names. */
  	exports.remap = {
  	  'assignAll': 'assign',
  	  'assignAllWith': 'assignWith',
  	  'assignInAll': 'assignIn',
  	  'assignInAllWith': 'assignInWith',
  	  'curryN': 'curry',
  	  'curryRightN': 'curryRight',
  	  'defaultsAll': 'defaults',
  	  'defaultsDeepAll': 'defaultsDeep',
  	  'findFrom': 'find',
  	  'findIndexFrom': 'findIndex',
  	  'findLastFrom': 'findLast',
  	  'findLastIndexFrom': 'findLastIndex',
  	  'getOr': 'get',
  	  'includesFrom': 'includes',
  	  'indexOfFrom': 'indexOf',
  	  'invokeArgs': 'invoke',
  	  'invokeArgsMap': 'invokeMap',
  	  'lastIndexOfFrom': 'lastIndexOf',
  	  'mergeAll': 'merge',
  	  'mergeAllWith': 'mergeWith',
  	  'padChars': 'pad',
  	  'padCharsEnd': 'padEnd',
  	  'padCharsStart': 'padStart',
  	  'propertyOf': 'get',
  	  'rangeStep': 'range',
  	  'rangeStepRight': 'rangeRight',
  	  'restFrom': 'rest',
  	  'spreadFrom': 'spread',
  	  'trimChars': 'trim',
  	  'trimCharsEnd': 'trimEnd',
  	  'trimCharsStart': 'trimStart',
  	  'zipAll': 'zip'
  	};

  	/** Used to track methods that skip fixing their arity. */
  	exports.skipFixed = {
  	  'castArray': true,
  	  'flow': true,
  	  'flowRight': true,
  	  'iteratee': true,
  	  'mixin': true,
  	  'rearg': true,
  	  'runInContext': true
  	};

  	/** Used to track methods that skip rearranging arguments. */
  	exports.skipRearg = {
  	  'add': true,
  	  'assign': true,
  	  'assignIn': true,
  	  'bind': true,
  	  'bindKey': true,
  	  'concat': true,
  	  'difference': true,
  	  'divide': true,
  	  'eq': true,
  	  'gt': true,
  	  'gte': true,
  	  'isEqual': true,
  	  'lt': true,
  	  'lte': true,
  	  'matchesProperty': true,
  	  'merge': true,
  	  'multiply': true,
  	  'overArgs': true,
  	  'partial': true,
  	  'partialRight': true,
  	  'propertyOf': true,
  	  'random': true,
  	  'range': true,
  	  'rangeRight': true,
  	  'subtract': true,
  	  'zip': true,
  	  'zipObject': true,
  	  'zipObjectDeep': true
  	}; 
  } (_mapping));

  /**
   * The default argument placeholder value for methods.
   *
   * @type {Object}
   */

  var placeholder;
  var hasRequiredPlaceholder;

  function requirePlaceholder () {
  	if (hasRequiredPlaceholder) return placeholder;
  	hasRequiredPlaceholder = 1;
  	placeholder = {};
  	return placeholder;
  }

  var mapping = _mapping,
      fallbackHolder = requirePlaceholder();

  /** Built-in value reference. */
  var push = Array.prototype.push;

  /**
   * Creates a function, with an arity of `n`, that invokes `func` with the
   * arguments it receives.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} n The arity of the new function.
   * @returns {Function} Returns the new function.
   */
  function baseArity(func, n) {
    return n == 2
      ? function(a, b) { return func.apply(undefined, arguments); }
      : function(a) { return func.apply(undefined, arguments); };
  }

  /**
   * Creates a function that invokes `func`, with up to `n` arguments, ignoring
   * any additional arguments.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @param {number} n The arity cap.
   * @returns {Function} Returns the new function.
   */
  function baseAry(func, n) {
    return n == 2
      ? function(a, b) { return func(a, b); }
      : function(a) { return func(a); };
  }

  /**
   * Creates a clone of `array`.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the cloned array.
   */
  function cloneArray(array) {
    var length = array ? array.length : 0,
        result = Array(length);

    while (length--) {
      result[length] = array[length];
    }
    return result;
  }

  /**
   * Creates a function that clones a given object using the assignment `func`.
   *
   * @private
   * @param {Function} func The assignment function.
   * @returns {Function} Returns the new cloner function.
   */
  function createCloner(func) {
    return function(object) {
      return func({}, object);
    };
  }

  /**
   * A specialized version of `_.spread` which flattens the spread array into
   * the arguments of the invoked `func`.
   *
   * @private
   * @param {Function} func The function to spread arguments over.
   * @param {number} start The start position of the spread.
   * @returns {Function} Returns the new function.
   */
  function flatSpread(func, start) {
    return function() {
      var length = arguments.length,
          lastIndex = length - 1,
          args = Array(length);

      while (length--) {
        args[length] = arguments[length];
      }
      var array = args[start],
          otherArgs = args.slice(0, start);

      if (array) {
        push.apply(otherArgs, array);
      }
      if (start != lastIndex) {
        push.apply(otherArgs, args.slice(start + 1));
      }
      return func.apply(this, otherArgs);
    };
  }

  /**
   * Creates a function that wraps `func` and uses `cloner` to clone the first
   * argument it receives.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} cloner The function to clone arguments.
   * @returns {Function} Returns the new immutable function.
   */
  function wrapImmutable(func, cloner) {
    return function() {
      var length = arguments.length;
      if (!length) {
        return;
      }
      var args = Array(length);
      while (length--) {
        args[length] = arguments[length];
      }
      var result = args[0] = cloner.apply(undefined, args);
      func.apply(undefined, args);
      return result;
    };
  }

  /**
   * The base implementation of `convert` which accepts a `util` object of methods
   * required to perform conversions.
   *
   * @param {Object} util The util object.
   * @param {string} name The name of the function to convert.
   * @param {Function} func The function to convert.
   * @param {Object} [options] The options object.
   * @param {boolean} [options.cap=true] Specify capping iteratee arguments.
   * @param {boolean} [options.curry=true] Specify currying.
   * @param {boolean} [options.fixed=true] Specify fixed arity.
   * @param {boolean} [options.immutable=true] Specify immutable operations.
   * @param {boolean} [options.rearg=true] Specify rearranging arguments.
   * @returns {Function|Object} Returns the converted function or object.
   */
  function baseConvert$1(util, name, func, options) {
    var isLib = typeof name == 'function',
        isObj = name === Object(name);

    if (isObj) {
      options = func;
      func = name;
      name = undefined;
    }
    if (func == null) {
      throw new TypeError;
    }
    options || (options = {});

    var config = {
      'cap': 'cap' in options ? options.cap : true,
      'curry': 'curry' in options ? options.curry : true,
      'fixed': 'fixed' in options ? options.fixed : true,
      'immutable': 'immutable' in options ? options.immutable : true,
      'rearg': 'rearg' in options ? options.rearg : true
    };

    var defaultHolder = isLib ? func : fallbackHolder,
        forceCurry = ('curry' in options) && options.curry,
        forceFixed = ('fixed' in options) && options.fixed,
        forceRearg = ('rearg' in options) && options.rearg,
        pristine = isLib ? func.runInContext() : undefined;

    var helpers = isLib ? func : {
      'ary': util.ary,
      'assign': util.assign,
      'clone': util.clone,
      'curry': util.curry,
      'forEach': util.forEach,
      'isArray': util.isArray,
      'isError': util.isError,
      'isFunction': util.isFunction,
      'isWeakMap': util.isWeakMap,
      'iteratee': util.iteratee,
      'keys': util.keys,
      'rearg': util.rearg,
      'toInteger': util.toInteger,
      'toPath': util.toPath
    };

    var ary = helpers.ary,
        assign = helpers.assign,
        clone = helpers.clone,
        curry = helpers.curry,
        each = helpers.forEach,
        isArray = helpers.isArray,
        isError = helpers.isError,
        isFunction = helpers.isFunction,
        isWeakMap = helpers.isWeakMap,
        keys = helpers.keys,
        rearg = helpers.rearg,
        toInteger = helpers.toInteger,
        toPath = helpers.toPath;

    var aryMethodKeys = keys(mapping.aryMethod);

    var wrappers = {
      'castArray': function(castArray) {
        return function() {
          var value = arguments[0];
          return isArray(value)
            ? castArray(cloneArray(value))
            : castArray.apply(undefined, arguments);
        };
      },
      'iteratee': function(iteratee) {
        return function() {
          var func = arguments[0],
              arity = arguments[1],
              result = iteratee(func, arity),
              length = result.length;

          if (config.cap && typeof arity == 'number') {
            arity = arity > 2 ? (arity - 2) : 1;
            return (length && length <= arity) ? result : baseAry(result, arity);
          }
          return result;
        };
      },
      'mixin': function(mixin) {
        return function(source) {
          var func = this;
          if (!isFunction(func)) {
            return mixin(func, Object(source));
          }
          var pairs = [];
          each(keys(source), function(key) {
            if (isFunction(source[key])) {
              pairs.push([key, func.prototype[key]]);
            }
          });

          mixin(func, Object(source));

          each(pairs, function(pair) {
            var value = pair[1];
            if (isFunction(value)) {
              func.prototype[pair[0]] = value;
            } else {
              delete func.prototype[pair[0]];
            }
          });
          return func;
        };
      },
      'nthArg': function(nthArg) {
        return function(n) {
          var arity = n < 0 ? 1 : (toInteger(n) + 1);
          return curry(nthArg(n), arity);
        };
      },
      'rearg': function(rearg) {
        return function(func, indexes) {
          var arity = indexes ? indexes.length : 0;
          return curry(rearg(func, indexes), arity);
        };
      },
      'runInContext': function(runInContext) {
        return function(context) {
          return baseConvert$1(util, runInContext(context), options);
        };
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * Casts `func` to a function with an arity capped iteratee if needed.
     *
     * @private
     * @param {string} name The name of the function to inspect.
     * @param {Function} func The function to inspect.
     * @returns {Function} Returns the cast function.
     */
    function castCap(name, func) {
      if (config.cap) {
        var indexes = mapping.iterateeRearg[name];
        if (indexes) {
          return iterateeRearg(func, indexes);
        }
        var n = !isLib && mapping.iterateeAry[name];
        if (n) {
          return iterateeAry(func, n);
        }
      }
      return func;
    }

    /**
     * Casts `func` to a curried function if needed.
     *
     * @private
     * @param {string} name The name of the function to inspect.
     * @param {Function} func The function to inspect.
     * @param {number} n The arity of `func`.
     * @returns {Function} Returns the cast function.
     */
    function castCurry(name, func, n) {
      return (forceCurry || (config.curry && n > 1))
        ? curry(func, n)
        : func;
    }

    /**
     * Casts `func` to a fixed arity function if needed.
     *
     * @private
     * @param {string} name The name of the function to inspect.
     * @param {Function} func The function to inspect.
     * @param {number} n The arity cap.
     * @returns {Function} Returns the cast function.
     */
    function castFixed(name, func, n) {
      if (config.fixed && (forceFixed || !mapping.skipFixed[name])) {
        var data = mapping.methodSpread[name],
            start = data && data.start;

        return start  === undefined ? ary(func, n) : flatSpread(func, start);
      }
      return func;
    }

    /**
     * Casts `func` to an rearged function if needed.
     *
     * @private
     * @param {string} name The name of the function to inspect.
     * @param {Function} func The function to inspect.
     * @param {number} n The arity of `func`.
     * @returns {Function} Returns the cast function.
     */
    function castRearg(name, func, n) {
      return (config.rearg && n > 1 && (forceRearg || !mapping.skipRearg[name]))
        ? rearg(func, mapping.methodRearg[name] || mapping.aryRearg[n])
        : func;
    }

    /**
     * Creates a clone of `object` by `path`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {Array|string} path The path to clone by.
     * @returns {Object} Returns the cloned object.
     */
    function cloneByPath(object, path) {
      path = toPath(path);

      var index = -1,
          length = path.length,
          lastIndex = length - 1,
          result = clone(Object(object)),
          nested = result;

      while (nested != null && ++index < length) {
        var key = path[index],
            value = nested[key];

        if (value != null &&
            !(isFunction(value) || isError(value) || isWeakMap(value))) {
          nested[key] = clone(index == lastIndex ? value : Object(value));
        }
        nested = nested[key];
      }
      return result;
    }

    /**
     * Converts `lodash` to an immutable auto-curried iteratee-first data-last
     * version with conversion `options` applied.
     *
     * @param {Object} [options] The options object. See `baseConvert` for more details.
     * @returns {Function} Returns the converted `lodash`.
     */
    function convertLib(options) {
      return _.runInContext.convert(options)(undefined);
    }

    /**
     * Create a converter function for `func` of `name`.
     *
     * @param {string} name The name of the function to convert.
     * @param {Function} func The function to convert.
     * @returns {Function} Returns the new converter function.
     */
    function createConverter(name, func) {
      var realName = mapping.aliasToReal[name] || name,
          methodName = mapping.remap[realName] || realName,
          oldOptions = options;

      return function(options) {
        var newUtil = isLib ? pristine : helpers,
            newFunc = isLib ? pristine[methodName] : func,
            newOptions = assign(assign({}, oldOptions), options);

        return baseConvert$1(newUtil, realName, newFunc, newOptions);
      };
    }

    /**
     * Creates a function that wraps `func` to invoke its iteratee, with up to `n`
     * arguments, ignoring any additional arguments.
     *
     * @private
     * @param {Function} func The function to cap iteratee arguments for.
     * @param {number} n The arity cap.
     * @returns {Function} Returns the new function.
     */
    function iterateeAry(func, n) {
      return overArg(func, function(func) {
        return typeof func == 'function' ? baseAry(func, n) : func;
      });
    }

    /**
     * Creates a function that wraps `func` to invoke its iteratee with arguments
     * arranged according to the specified `indexes` where the argument value at
     * the first index is provided as the first argument, the argument value at
     * the second index is provided as the second argument, and so on.
     *
     * @private
     * @param {Function} func The function to rearrange iteratee arguments for.
     * @param {number[]} indexes The arranged argument indexes.
     * @returns {Function} Returns the new function.
     */
    function iterateeRearg(func, indexes) {
      return overArg(func, function(func) {
        var n = indexes.length;
        return baseArity(rearg(baseAry(func, n), indexes), n);
      });
    }

    /**
     * Creates a function that invokes `func` with its first argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function() {
        var length = arguments.length;
        if (!length) {
          return func();
        }
        var args = Array(length);
        while (length--) {
          args[length] = arguments[length];
        }
        var index = config.rearg ? 0 : (length - 1);
        args[index] = transform(args[index]);
        return func.apply(undefined, args);
      };
    }

    /**
     * Creates a function that wraps `func` and applys the conversions
     * rules by `name`.
     *
     * @private
     * @param {string} name The name of the function to wrap.
     * @param {Function} func The function to wrap.
     * @returns {Function} Returns the converted function.
     */
    function wrap(name, func, placeholder) {
      var result,
          realName = mapping.aliasToReal[name] || name,
          wrapped = func,
          wrapper = wrappers[realName];

      if (wrapper) {
        wrapped = wrapper(func);
      }
      else if (config.immutable) {
        if (mapping.mutate.array[realName]) {
          wrapped = wrapImmutable(func, cloneArray);
        }
        else if (mapping.mutate.object[realName]) {
          wrapped = wrapImmutable(func, createCloner(func));
        }
        else if (mapping.mutate.set[realName]) {
          wrapped = wrapImmutable(func, cloneByPath);
        }
      }
      each(aryMethodKeys, function(aryKey) {
        each(mapping.aryMethod[aryKey], function(otherName) {
          if (realName == otherName) {
            var data = mapping.methodSpread[realName],
                afterRearg = data && data.afterRearg;

            result = afterRearg
              ? castFixed(realName, castRearg(realName, wrapped, aryKey), aryKey)
              : castRearg(realName, castFixed(realName, wrapped, aryKey), aryKey);

            result = castCap(realName, result);
            result = castCurry(realName, result, aryKey);
            return false;
          }
        });
        return !result;
      });

      result || (result = wrapped);
      if (result == func) {
        result = forceCurry ? curry(result, 1) : function() {
          return func.apply(this, arguments);
        };
      }
      result.convert = createConverter(realName, func);
      result.placeholder = func.placeholder = placeholder;

      return result;
    }

    /*--------------------------------------------------------------------------*/

    if (!isObj) {
      return wrap(name, func, defaultHolder);
    }
    var _ = func;

    // Convert methods by ary cap.
    var pairs = [];
    each(aryMethodKeys, function(aryKey) {
      each(mapping.aryMethod[aryKey], function(key) {
        var func = _[mapping.remap[key] || key];
        if (func) {
          pairs.push([key, wrap(key, func, _)]);
        }
      });
    });

    // Convert remaining methods.
    each(keys(_), function(key) {
      var func = _[key];
      if (typeof func == 'function') {
        var length = pairs.length;
        while (length--) {
          if (pairs[length][0] == key) {
            return;
          }
        }
        func.convert = createConverter(key, func);
        pairs.push([key, func]);
      }
    });

    // Assign to `_` leaving `_.prototype` unchanged to allow chaining.
    each(pairs, function(pair) {
      _[pair[0]] = pair[1];
    });

    _.convert = convertLib;
    _.placeholder = _;

    // Assign aliases.
    each(keys(_), function(key) {
      each(mapping.realToAlias[key] || [], function(alias) {
        _[alias] = _[key];
      });
    });

    return _;
  }

  var _baseConvert = baseConvert$1;

  /**
   * This method returns the first argument it receives.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'a': 1 };
   *
   * console.log(_.identity(object) === object);
   * // => true
   */

  function identity$3(value) {
    return value;
  }

  var identity_1 = identity$3;

  /** Detect free variable `global` from Node.js. */

  var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  var _freeGlobal = freeGlobal$1;

  var freeGlobal = _freeGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root$c = freeGlobal || freeSelf || Function('return this')();

  var _root = root$c;

  var root$b = _root;

  /** Built-in value references. */
  var Symbol$7 = root$b.Symbol;

  var _Symbol = Symbol$7;

  var Symbol$6 = _Symbol;

  /** Used for built-in method references. */
  var objectProto$h = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$e = objectProto$h.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$h.toString;

  /** Built-in value references. */
  var symToStringTag$1 = Symbol$6 ? Symbol$6.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag$1(value) {
    var isOwn = hasOwnProperty$e.call(value, symToStringTag$1),
        tag = value[symToStringTag$1];

    try {
      value[symToStringTag$1] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }

  var _getRawTag = getRawTag$1;

  /** Used for built-in method references. */

  var objectProto$g = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto$g.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString$1(value) {
    return nativeObjectToString.call(value);
  }

  var _objectToString = objectToString$1;

  var Symbol$5 = _Symbol,
      getRawTag = _getRawTag,
      objectToString = _objectToString;

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag = Symbol$5 ? Symbol$5.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag$7(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  var _baseGetTag = baseGetTag$7;

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */

  function isObject$8(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  var isObject_1 = isObject$8;

  var baseGetTag$6 = _baseGetTag,
      isObject$7 = isObject_1;

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag$2 = '[object Function]',
      genTag$1 = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction$3(value) {
    if (!isObject$7(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag$6(value);
    return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
  }

  var isFunction_1 = isFunction$3;

  var root$a = _root;

  /** Used to detect overreaching core-js shims. */
  var coreJsData$1 = root$a['__core-js_shared__'];

  var _coreJsData = coreJsData$1;

  var coreJsData = _coreJsData;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked$1(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  var _isMasked = isMasked$1;

  /** Used for built-in method references. */

  var funcProto$2 = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$2 = funcProto$2.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource$2(func) {
    if (func != null) {
      try {
        return funcToString$2.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  var _toSource = toSource$2;

  var isFunction$2 = isFunction_1,
      isMasked = _isMasked,
      isObject$6 = isObject_1,
      toSource$1 = _toSource;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto$1 = Function.prototype,
      objectProto$f = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$d = objectProto$f.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString$1.call(hasOwnProperty$d).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative$1(value) {
    if (!isObject$6(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction$2(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource$1(value));
  }

  var _baseIsNative = baseIsNative$1;

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */

  function getValue$1(object, key) {
    return object == null ? undefined : object[key];
  }

  var _getValue = getValue$1;

  var baseIsNative = _baseIsNative,
      getValue = _getValue;

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative$7(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  var _getNative = getNative$7;

  var getNative$6 = _getNative,
      root$9 = _root;

  /* Built-in method references that are verified to be native. */
  var WeakMap$3 = getNative$6(root$9, 'WeakMap');

  var _WeakMap = WeakMap$3;

  var WeakMap$2 = _WeakMap;

  /** Used to store function metadata. */
  var metaMap$2 = WeakMap$2 && new WeakMap$2;

  var _metaMap = metaMap$2;

  var identity$2 = identity_1,
      metaMap$1 = _metaMap;

  /**
   * The base implementation of `setData` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to associate metadata with.
   * @param {*} data The metadata.
   * @returns {Function} Returns `func`.
   */
  var baseSetData$2 = !metaMap$1 ? identity$2 : function(func, data) {
    metaMap$1.set(func, data);
    return func;
  };

  var _baseSetData = baseSetData$2;

  var isObject$5 = isObject_1;

  /** Built-in value references. */
  var objectCreate = Object.create;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} proto The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate$4 = (function() {
    function object() {}
    return function(proto) {
      if (!isObject$5(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object;
      object.prototype = undefined;
      return result;
    };
  }());

  var _baseCreate = baseCreate$4;

  var baseCreate$3 = _baseCreate,
      isObject$4 = isObject_1;

  /**
   * Creates a function that produces an instance of `Ctor` regardless of
   * whether it was invoked as part of a `new` expression or by `call` or `apply`.
   *
   * @private
   * @param {Function} Ctor The constructor to wrap.
   * @returns {Function} Returns the new wrapped function.
   */
  function createCtor$4(Ctor) {
    return function() {
      // Use a `switch` statement to work with class constructors. See
      // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
      // for more details.
      var args = arguments;
      switch (args.length) {
        case 0: return new Ctor;
        case 1: return new Ctor(args[0]);
        case 2: return new Ctor(args[0], args[1]);
        case 3: return new Ctor(args[0], args[1], args[2]);
        case 4: return new Ctor(args[0], args[1], args[2], args[3]);
        case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
        case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
        case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
      }
      var thisBinding = baseCreate$3(Ctor.prototype),
          result = Ctor.apply(thisBinding, args);

      // Mimic the constructor's `return` behavior.
      // See https://es5.github.io/#x13.2.2 for more details.
      return isObject$4(result) ? result : thisBinding;
    };
  }

  var _createCtor = createCtor$4;

  var createCtor$3 = _createCtor,
      root$8 = _root;

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG$6 = 1;

  /**
   * Creates a function that wraps `func` to invoke it with the optional `this`
   * binding of `thisArg`.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createBind$1(func, bitmask, thisArg) {
    var isBind = bitmask & WRAP_BIND_FLAG$6,
        Ctor = createCtor$3(func);

    function wrapper() {
      var fn = (this && this !== root$8 && this instanceof wrapper) ? Ctor : func;
      return fn.apply(isBind ? thisArg : this, arguments);
    }
    return wrapper;
  }

  var _createBind = createBind$1;

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */

  function apply$3(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  var _apply = apply$3;

  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeMax$3 = Math.max;

  /**
   * Creates an array that is the composition of partially applied arguments,
   * placeholders, and provided arguments into a single array of arguments.
   *
   * @private
   * @param {Array} args The provided arguments.
   * @param {Array} partials The arguments to prepend to those provided.
   * @param {Array} holders The `partials` placeholder indexes.
   * @params {boolean} [isCurried] Specify composing for a curried function.
   * @returns {Array} Returns the new array of composed arguments.
   */
  function composeArgs$2(args, partials, holders, isCurried) {
    var argsIndex = -1,
        argsLength = args.length,
        holdersLength = holders.length,
        leftIndex = -1,
        leftLength = partials.length,
        rangeLength = nativeMax$3(argsLength - holdersLength, 0),
        result = Array(leftLength + rangeLength),
        isUncurried = !isCurried;

    while (++leftIndex < leftLength) {
      result[leftIndex] = partials[leftIndex];
    }
    while (++argsIndex < holdersLength) {
      if (isUncurried || argsIndex < argsLength) {
        result[holders[argsIndex]] = args[argsIndex];
      }
    }
    while (rangeLength--) {
      result[leftIndex++] = args[argsIndex++];
    }
    return result;
  }

  var _composeArgs = composeArgs$2;

  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeMax$2 = Math.max;

  /**
   * This function is like `composeArgs` except that the arguments composition
   * is tailored for `_.partialRight`.
   *
   * @private
   * @param {Array} args The provided arguments.
   * @param {Array} partials The arguments to append to those provided.
   * @param {Array} holders The `partials` placeholder indexes.
   * @params {boolean} [isCurried] Specify composing for a curried function.
   * @returns {Array} Returns the new array of composed arguments.
   */
  function composeArgsRight$2(args, partials, holders, isCurried) {
    var argsIndex = -1,
        argsLength = args.length,
        holdersIndex = -1,
        holdersLength = holders.length,
        rightIndex = -1,
        rightLength = partials.length,
        rangeLength = nativeMax$2(argsLength - holdersLength, 0),
        result = Array(rangeLength + rightLength),
        isUncurried = !isCurried;

    while (++argsIndex < rangeLength) {
      result[argsIndex] = args[argsIndex];
    }
    var offset = argsIndex;
    while (++rightIndex < rightLength) {
      result[offset + rightIndex] = partials[rightIndex];
    }
    while (++holdersIndex < holdersLength) {
      if (isUncurried || argsIndex < argsLength) {
        result[offset + holders[holdersIndex]] = args[argsIndex++];
      }
    }
    return result;
  }

  var _composeArgsRight = composeArgsRight$2;

  /**
   * Gets the number of `placeholder` occurrences in `array`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} placeholder The placeholder to search for.
   * @returns {number} Returns the placeholder count.
   */

  function countHolders$1(array, placeholder) {
    var length = array.length,
        result = 0;

    while (length--) {
      if (array[length] === placeholder) {
        ++result;
      }
    }
    return result;
  }

  var _countHolders = countHolders$1;

  /**
   * The function whose prototype chain sequence wrappers inherit from.
   *
   * @private
   */

  function baseLodash$3() {
    // No operation performed.
  }

  var _baseLodash = baseLodash$3;

  var baseCreate$2 = _baseCreate,
      baseLodash$2 = _baseLodash;

  /** Used as references for the maximum length and index of an array. */
  var MAX_ARRAY_LENGTH = 4294967295;

  /**
   * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
   *
   * @private
   * @constructor
   * @param {*} value The value to wrap.
   */
  function LazyWrapper$3(value) {
    this.__wrapped__ = value;
    this.__actions__ = [];
    this.__dir__ = 1;
    this.__filtered__ = false;
    this.__iteratees__ = [];
    this.__takeCount__ = MAX_ARRAY_LENGTH;
    this.__views__ = [];
  }

  // Ensure `LazyWrapper` is an instance of `baseLodash`.
  LazyWrapper$3.prototype = baseCreate$2(baseLodash$2.prototype);
  LazyWrapper$3.prototype.constructor = LazyWrapper$3;

  var _LazyWrapper = LazyWrapper$3;

  /**
   * This method returns `undefined`.
   *
   * @static
   * @memberOf _
   * @since 2.3.0
   * @category Util
   * @example
   *
   * _.times(2, _.noop);
   * // => [undefined, undefined]
   */

  function noop$2() {
    // No operation performed.
  }

  var noop_1 = noop$2;

  var metaMap = _metaMap,
      noop$1 = noop_1;

  /**
   * Gets metadata for `func`.
   *
   * @private
   * @param {Function} func The function to query.
   * @returns {*} Returns the metadata for `func`.
   */
  var getData$2 = !metaMap ? noop$1 : function(func) {
    return metaMap.get(func);
  };

  var _getData = getData$2;

  /** Used to lookup unminified function names. */

  var realNames$1 = {};

  var _realNames = realNames$1;

  var realNames = _realNames;

  /** Used for built-in method references. */
  var objectProto$e = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$c = objectProto$e.hasOwnProperty;

  /**
   * Gets the name of `func`.
   *
   * @private
   * @param {Function} func The function to query.
   * @returns {string} Returns the function name.
   */
  function getFuncName$1(func) {
    var result = (func.name + ''),
        array = realNames[result],
        length = hasOwnProperty$c.call(realNames, result) ? array.length : 0;

    while (length--) {
      var data = array[length],
          otherFunc = data.func;
      if (otherFunc == null || otherFunc == func) {
        return data.name;
      }
    }
    return result;
  }

  var _getFuncName = getFuncName$1;

  var baseCreate$1 = _baseCreate,
      baseLodash$1 = _baseLodash;

  /**
   * The base constructor for creating `lodash` wrapper objects.
   *
   * @private
   * @param {*} value The value to wrap.
   * @param {boolean} [chainAll] Enable explicit method chain sequences.
   */
  function LodashWrapper$2(value, chainAll) {
    this.__wrapped__ = value;
    this.__actions__ = [];
    this.__chain__ = !!chainAll;
    this.__index__ = 0;
    this.__values__ = undefined;
  }

  LodashWrapper$2.prototype = baseCreate$1(baseLodash$1.prototype);
  LodashWrapper$2.prototype.constructor = LodashWrapper$2;

  var _LodashWrapper = LodashWrapper$2;

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */

  var isArray$d = Array.isArray;

  var isArray_1 = isArray$d;

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */

  function isObjectLike$b(value) {
    return value != null && typeof value == 'object';
  }

  var isObjectLike_1 = isObjectLike$b;

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */

  function copyArray$4(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  var _copyArray = copyArray$4;

  var LazyWrapper$2 = _LazyWrapper,
      LodashWrapper$1 = _LodashWrapper,
      copyArray$3 = _copyArray;

  /**
   * Creates a clone of `wrapper`.
   *
   * @private
   * @param {Object} wrapper The wrapper to clone.
   * @returns {Object} Returns the cloned wrapper.
   */
  function wrapperClone$1(wrapper) {
    if (wrapper instanceof LazyWrapper$2) {
      return wrapper.clone();
    }
    var result = new LodashWrapper$1(wrapper.__wrapped__, wrapper.__chain__);
    result.__actions__ = copyArray$3(wrapper.__actions__);
    result.__index__  = wrapper.__index__;
    result.__values__ = wrapper.__values__;
    return result;
  }

  var _wrapperClone = wrapperClone$1;

  var LazyWrapper$1 = _LazyWrapper,
      LodashWrapper = _LodashWrapper,
      baseLodash = _baseLodash,
      isArray$c = isArray_1,
      isObjectLike$a = isObjectLike_1,
      wrapperClone = _wrapperClone;

  /** Used for built-in method references. */
  var objectProto$d = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$b = objectProto$d.hasOwnProperty;

  /**
   * Creates a `lodash` object which wraps `value` to enable implicit method
   * chain sequences. Methods that operate on and return arrays, collections,
   * and functions can be chained together. Methods that retrieve a single value
   * or may return a primitive value will automatically end the chain sequence
   * and return the unwrapped value. Otherwise, the value must be unwrapped
   * with `_#value`.
   *
   * Explicit chain sequences, which must be unwrapped with `_#value`, may be
   * enabled using `_.chain`.
   *
   * The execution of chained methods is lazy, that is, it's deferred until
   * `_#value` is implicitly or explicitly called.
   *
   * Lazy evaluation allows several methods to support shortcut fusion.
   * Shortcut fusion is an optimization to merge iteratee calls; this avoids
   * the creation of intermediate arrays and can greatly reduce the number of
   * iteratee executions. Sections of a chain sequence qualify for shortcut
   * fusion if the section is applied to an array and iteratees accept only
   * one argument. The heuristic for whether a section qualifies for shortcut
   * fusion is subject to change.
   *
   * Chaining is supported in custom builds as long as the `_#value` method is
   * directly or indirectly included in the build.
   *
   * In addition to lodash methods, wrappers have `Array` and `String` methods.
   *
   * The wrapper `Array` methods are:
   * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
   *
   * The wrapper `String` methods are:
   * `replace` and `split`
   *
   * The wrapper methods that support shortcut fusion are:
   * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
   * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
   * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
   *
   * The chainable wrapper methods are:
   * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
   * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
   * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
   * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
   * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
   * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
   * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
   * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
   * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
   * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
   * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
   * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
   * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
   * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
   * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
   * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
   * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
   * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
   * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
   * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
   * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
   * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
   * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
   * `zipObject`, `zipObjectDeep`, and `zipWith`
   *
   * The wrapper methods that are **not** chainable by default are:
   * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
   * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
   * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
   * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
   * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
   * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
   * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
   * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
   * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
   * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
   * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
   * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
   * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
   * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
   * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
   * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
   * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
   * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
   * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
   * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
   * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
   * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
   * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
   * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
   * `upperFirst`, `value`, and `words`
   *
   * @name _
   * @constructor
   * @category Seq
   * @param {*} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * function square(n) {
   *   return n * n;
   * }
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // Returns an unwrapped value.
   * wrapped.reduce(_.add);
   * // => 6
   *
   * // Returns a wrapped value.
   * var squares = wrapped.map(square);
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
  function lodash$1(value) {
    if (isObjectLike$a(value) && !isArray$c(value) && !(value instanceof LazyWrapper$1)) {
      if (value instanceof LodashWrapper) {
        return value;
      }
      if (hasOwnProperty$b.call(value, '__wrapped__')) {
        return wrapperClone(value);
      }
    }
    return new LodashWrapper(value);
  }

  // Ensure wrappers are instances of `baseLodash`.
  lodash$1.prototype = baseLodash.prototype;
  lodash$1.prototype.constructor = lodash$1;

  var wrapperLodash = lodash$1;

  var LazyWrapper = _LazyWrapper,
      getData$1 = _getData,
      getFuncName = _getFuncName,
      lodash = wrapperLodash;

  /**
   * Checks if `func` has a lazy counterpart.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
   *  else `false`.
   */
  function isLaziable$1(func) {
    var funcName = getFuncName(func),
        other = lodash[funcName];

    if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
      return false;
    }
    if (func === other) {
      return true;
    }
    var data = getData$1(other);
    return !!data && func === data[0];
  }

  var _isLaziable = isLaziable$1;

  /** Used to detect hot functions by number of calls within a span of milliseconds. */

  var HOT_COUNT = 800,
      HOT_SPAN = 16;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeNow = Date.now;

  /**
   * Creates a function that'll short out and invoke `identity` instead
   * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
   * milliseconds.
   *
   * @private
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new shortable function.
   */
  function shortOut$2(func) {
    var count = 0,
        lastCalled = 0;

    return function() {
      var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }

  var _shortOut = shortOut$2;

  var baseSetData$1 = _baseSetData,
      shortOut$1 = _shortOut;

  /**
   * Sets metadata for `func`.
   *
   * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
   * period of time, it will trip its breaker and transition to an identity
   * function to avoid garbage collection pauses in V8. See
   * [V8 issue 2070](https://bugs.chromium.org/p/v8/issues/detail?id=2070)
   * for more details.
   *
   * @private
   * @param {Function} func The function to associate metadata with.
   * @param {*} data The metadata.
   * @returns {Function} Returns `func`.
   */
  var setData$2 = shortOut$1(baseSetData$1);

  var _setData = setData$2;

  /** Used to match wrap detail comments. */

  var reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
      reSplitDetails = /,? & /;

  /**
   * Extracts wrapper details from the `source` body comment.
   *
   * @private
   * @param {string} source The source to inspect.
   * @returns {Array} Returns the wrapper details.
   */
  function getWrapDetails$1(source) {
    var match = source.match(reWrapDetails);
    return match ? match[1].split(reSplitDetails) : [];
  }

  var _getWrapDetails = getWrapDetails$1;

  /** Used to match wrap detail comments. */

  var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/;

  /**
   * Inserts wrapper `details` in a comment at the top of the `source` body.
   *
   * @private
   * @param {string} source The source to modify.
   * @returns {Array} details The details to insert.
   * @returns {string} Returns the modified source.
   */
  function insertWrapDetails$1(source, details) {
    var length = details.length;
    if (!length) {
      return source;
    }
    var lastIndex = length - 1;
    details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
    details = details.join(length > 2 ? ', ' : ' ');
    return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
  }

  var _insertWrapDetails = insertWrapDetails$1;

  /**
   * Creates a function that returns `value`.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {*} value The value to return from the new function.
   * @returns {Function} Returns the new constant function.
   * @example
   *
   * var objects = _.times(2, _.constant({ 'a': 1 }));
   *
   * console.log(objects);
   * // => [{ 'a': 1 }, { 'a': 1 }]
   *
   * console.log(objects[0] === objects[1]);
   * // => true
   */

  function constant$1(value) {
    return function() {
      return value;
    };
  }

  var constant_1 = constant$1;

  var getNative$5 = _getNative;

  var defineProperty$2 = (function() {
    try {
      var func = getNative$5(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  var _defineProperty = defineProperty$2;

  var constant = constant_1,
      defineProperty$1 = _defineProperty,
      identity$1 = identity_1;

  /**
   * The base implementation of `setToString` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var baseSetToString$1 = !defineProperty$1 ? identity$1 : function(func, string) {
    return defineProperty$1(func, 'toString', {
      'configurable': true,
      'enumerable': false,
      'value': constant(string),
      'writable': true
    });
  };

  var _baseSetToString = baseSetToString$1;

  var baseSetToString = _baseSetToString,
      shortOut = _shortOut;

  /**
   * Sets the `toString` method of `func` to return `string`.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var setToString$2 = shortOut(baseSetToString);

  var _setToString = setToString$2;

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */

  function arrayEach$2(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  var _arrayEach = arrayEach$2;

  /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} predicate The function invoked per iteration.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */

  function baseFindIndex$1(array, predicate, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 1 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  var _baseFindIndex = baseFindIndex$1;

  /**
   * The base implementation of `_.isNaN` without support for number objects.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
   */

  function baseIsNaN$1(value) {
    return value !== value;
  }

  var _baseIsNaN = baseIsNaN$1;

  /**
   * A specialized version of `_.indexOf` which performs strict equality
   * comparisons of values, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */

  function strictIndexOf$1(array, value, fromIndex) {
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  var _strictIndexOf = strictIndexOf$1;

  var baseFindIndex = _baseFindIndex,
      baseIsNaN = _baseIsNaN,
      strictIndexOf = _strictIndexOf;

  /**
   * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOf$1(array, value, fromIndex) {
    return value === value
      ? strictIndexOf(array, value, fromIndex)
      : baseFindIndex(array, baseIsNaN, fromIndex);
  }

  var _baseIndexOf = baseIndexOf$1;

  var baseIndexOf = _baseIndexOf;

  /**
   * A specialized version of `_.includes` for arrays without support for
   * specifying an index to search from.
   *
   * @private
   * @param {Array} [array] The array to inspect.
   * @param {*} target The value to search for.
   * @returns {boolean} Returns `true` if `target` is found, else `false`.
   */
  function arrayIncludes$1(array, value) {
    var length = array == null ? 0 : array.length;
    return !!length && baseIndexOf(array, value, 0) > -1;
  }

  var _arrayIncludes = arrayIncludes$1;

  var arrayEach$1 = _arrayEach,
      arrayIncludes = _arrayIncludes;

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG$5 = 1,
      WRAP_BIND_KEY_FLAG$4 = 2,
      WRAP_CURRY_FLAG$5 = 8,
      WRAP_CURRY_RIGHT_FLAG$2 = 16,
      WRAP_PARTIAL_FLAG$2 = 32,
      WRAP_PARTIAL_RIGHT_FLAG$2 = 64,
      WRAP_ARY_FLAG$3 = 128,
      WRAP_REARG_FLAG$2 = 256,
      WRAP_FLIP_FLAG$1 = 512;

  /** Used to associate wrap methods with their bit flags. */
  var wrapFlags = [
    ['ary', WRAP_ARY_FLAG$3],
    ['bind', WRAP_BIND_FLAG$5],
    ['bindKey', WRAP_BIND_KEY_FLAG$4],
    ['curry', WRAP_CURRY_FLAG$5],
    ['curryRight', WRAP_CURRY_RIGHT_FLAG$2],
    ['flip', WRAP_FLIP_FLAG$1],
    ['partial', WRAP_PARTIAL_FLAG$2],
    ['partialRight', WRAP_PARTIAL_RIGHT_FLAG$2],
    ['rearg', WRAP_REARG_FLAG$2]
  ];

  /**
   * Updates wrapper `details` based on `bitmask` flags.
   *
   * @private
   * @returns {Array} details The details to modify.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @returns {Array} Returns `details`.
   */
  function updateWrapDetails$1(details, bitmask) {
    arrayEach$1(wrapFlags, function(pair) {
      var value = '_.' + pair[0];
      if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
        details.push(value);
      }
    });
    return details.sort();
  }

  var _updateWrapDetails = updateWrapDetails$1;

  var getWrapDetails = _getWrapDetails,
      insertWrapDetails = _insertWrapDetails,
      setToString$1 = _setToString,
      updateWrapDetails = _updateWrapDetails;

  /**
   * Sets the `toString` method of `wrapper` to mimic the source of `reference`
   * with wrapper details in a comment at the top of the source body.
   *
   * @private
   * @param {Function} wrapper The function to modify.
   * @param {Function} reference The reference function.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @returns {Function} Returns `wrapper`.
   */
  function setWrapToString$2(wrapper, reference, bitmask) {
    var source = (reference + '');
    return setToString$1(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
  }

  var _setWrapToString = setWrapToString$2;

  var isLaziable = _isLaziable,
      setData$1 = _setData,
      setWrapToString$1 = _setWrapToString;

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG$4 = 1,
      WRAP_BIND_KEY_FLAG$3 = 2,
      WRAP_CURRY_BOUND_FLAG$1 = 4,
      WRAP_CURRY_FLAG$4 = 8,
      WRAP_PARTIAL_FLAG$1 = 32,
      WRAP_PARTIAL_RIGHT_FLAG$1 = 64;

  /**
   * Creates a function that wraps `func` to continue currying.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @param {Function} wrapFunc The function to create the `func` wrapper.
   * @param {*} placeholder The placeholder value.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {Array} [partials] The arguments to prepend to those provided to
   *  the new function.
   * @param {Array} [holders] The `partials` placeholder indexes.
   * @param {Array} [argPos] The argument positions of the new function.
   * @param {number} [ary] The arity cap of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createRecurry$2(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
    var isCurry = bitmask & WRAP_CURRY_FLAG$4,
        newHolders = isCurry ? holders : undefined,
        newHoldersRight = isCurry ? undefined : holders,
        newPartials = isCurry ? partials : undefined,
        newPartialsRight = isCurry ? undefined : partials;

    bitmask |= (isCurry ? WRAP_PARTIAL_FLAG$1 : WRAP_PARTIAL_RIGHT_FLAG$1);
    bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG$1 : WRAP_PARTIAL_FLAG$1);

    if (!(bitmask & WRAP_CURRY_BOUND_FLAG$1)) {
      bitmask &= ~(WRAP_BIND_FLAG$4 | WRAP_BIND_KEY_FLAG$3);
    }
    var newData = [
      func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
      newHoldersRight, argPos, ary, arity
    ];

    var result = wrapFunc.apply(undefined, newData);
    if (isLaziable(func)) {
      setData$1(result, newData);
    }
    result.placeholder = placeholder;
    return setWrapToString$1(result, func, bitmask);
  }

  var _createRecurry = createRecurry$2;

  /**
   * Gets the argument placeholder value for `func`.
   *
   * @private
   * @param {Function} func The function to inspect.
   * @returns {*} Returns the placeholder value.
   */

  function getHolder$2(func) {
    var object = func;
    return object.placeholder;
  }

  var _getHolder = getHolder$2;

  /** Used as references for various `Number` constants. */

  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex$3(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER$1 : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  var _isIndex = isIndex$3;

  var copyArray$2 = _copyArray,
      isIndex$2 = _isIndex;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMin$1 = Math.min;

  /**
   * Reorder `array` according to the specified indexes where the element at
   * the first index is assigned as the first element, the element at
   * the second index is assigned as the second element, and so on.
   *
   * @private
   * @param {Array} array The array to reorder.
   * @param {Array} indexes The arranged array indexes.
   * @returns {Array} Returns `array`.
   */
  function reorder$1(array, indexes) {
    var arrLength = array.length,
        length = nativeMin$1(indexes.length, arrLength),
        oldArray = copyArray$2(array);

    while (length--) {
      var index = indexes[length];
      array[length] = isIndex$2(index, arrLength) ? oldArray[index] : undefined;
    }
    return array;
  }

  var _reorder = reorder$1;

  /** Used as the internal argument placeholder. */

  var PLACEHOLDER$1 = '__lodash_placeholder__';

  /**
   * Replaces all `placeholder` elements in `array` with an internal placeholder
   * and returns an array of their indexes.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {*} placeholder The placeholder to replace.
   * @returns {Array} Returns the new array of placeholder indexes.
   */
  function replaceHolders$3(array, placeholder) {
    var index = -1,
        length = array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (value === placeholder || value === PLACEHOLDER$1) {
        array[index] = PLACEHOLDER$1;
        result[resIndex++] = index;
      }
    }
    return result;
  }

  var _replaceHolders = replaceHolders$3;

  var composeArgs$1 = _composeArgs,
      composeArgsRight$1 = _composeArgsRight,
      countHolders = _countHolders,
      createCtor$2 = _createCtor,
      createRecurry$1 = _createRecurry,
      getHolder$1 = _getHolder,
      reorder = _reorder,
      replaceHolders$2 = _replaceHolders,
      root$7 = _root;

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG$3 = 1,
      WRAP_BIND_KEY_FLAG$2 = 2,
      WRAP_CURRY_FLAG$3 = 8,
      WRAP_CURRY_RIGHT_FLAG$1 = 16,
      WRAP_ARY_FLAG$2 = 128,
      WRAP_FLIP_FLAG = 512;

  /**
   * Creates a function that wraps `func` to invoke it with optional `this`
   * binding of `thisArg`, partial application, and currying.
   *
   * @private
   * @param {Function|string} func The function or method name to wrap.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {Array} [partials] The arguments to prepend to those provided to
   *  the new function.
   * @param {Array} [holders] The `partials` placeholder indexes.
   * @param {Array} [partialsRight] The arguments to append to those provided
   *  to the new function.
   * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
   * @param {Array} [argPos] The argument positions of the new function.
   * @param {number} [ary] The arity cap of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createHybrid$2(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
    var isAry = bitmask & WRAP_ARY_FLAG$2,
        isBind = bitmask & WRAP_BIND_FLAG$3,
        isBindKey = bitmask & WRAP_BIND_KEY_FLAG$2,
        isCurried = bitmask & (WRAP_CURRY_FLAG$3 | WRAP_CURRY_RIGHT_FLAG$1),
        isFlip = bitmask & WRAP_FLIP_FLAG,
        Ctor = isBindKey ? undefined : createCtor$2(func);

    function wrapper() {
      var length = arguments.length,
          args = Array(length),
          index = length;

      while (index--) {
        args[index] = arguments[index];
      }
      if (isCurried) {
        var placeholder = getHolder$1(wrapper),
            holdersCount = countHolders(args, placeholder);
      }
      if (partials) {
        args = composeArgs$1(args, partials, holders, isCurried);
      }
      if (partialsRight) {
        args = composeArgsRight$1(args, partialsRight, holdersRight, isCurried);
      }
      length -= holdersCount;
      if (isCurried && length < arity) {
        var newHolders = replaceHolders$2(args, placeholder);
        return createRecurry$1(
          func, bitmask, createHybrid$2, wrapper.placeholder, thisArg,
          args, newHolders, argPos, ary, arity - length
        );
      }
      var thisBinding = isBind ? thisArg : this,
          fn = isBindKey ? thisBinding[func] : func;

      length = args.length;
      if (argPos) {
        args = reorder(args, argPos);
      } else if (isFlip && length > 1) {
        args.reverse();
      }
      if (isAry && ary < length) {
        args.length = ary;
      }
      if (this && this !== root$7 && this instanceof wrapper) {
        fn = Ctor || createCtor$2(fn);
      }
      return fn.apply(thisBinding, args);
    }
    return wrapper;
  }

  var _createHybrid = createHybrid$2;

  var apply$2 = _apply,
      createCtor$1 = _createCtor,
      createHybrid$1 = _createHybrid,
      createRecurry = _createRecurry,
      getHolder = _getHolder,
      replaceHolders$1 = _replaceHolders,
      root$6 = _root;

  /**
   * Creates a function that wraps `func` to enable currying.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @param {number} arity The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createCurry$1(func, bitmask, arity) {
    var Ctor = createCtor$1(func);

    function wrapper() {
      var length = arguments.length,
          args = Array(length),
          index = length,
          placeholder = getHolder(wrapper);

      while (index--) {
        args[index] = arguments[index];
      }
      var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
        ? []
        : replaceHolders$1(args, placeholder);

      length -= holders.length;
      if (length < arity) {
        return createRecurry(
          func, bitmask, createHybrid$1, wrapper.placeholder, undefined,
          args, holders, undefined, undefined, arity - length);
      }
      var fn = (this && this !== root$6 && this instanceof wrapper) ? Ctor : func;
      return apply$2(fn, this, args);
    }
    return wrapper;
  }

  var _createCurry = createCurry$1;

  var apply$1 = _apply,
      createCtor = _createCtor,
      root$5 = _root;

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG$2 = 1;

  /**
   * Creates a function that wraps `func` to invoke it with the `this` binding
   * of `thisArg` and `partials` prepended to the arguments it receives.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} partials The arguments to prepend to those provided to
   *  the new function.
   * @returns {Function} Returns the new wrapped function.
   */
  function createPartial$1(func, bitmask, thisArg, partials) {
    var isBind = bitmask & WRAP_BIND_FLAG$2,
        Ctor = createCtor(func);

    function wrapper() {
      var argsIndex = -1,
          argsLength = arguments.length,
          leftIndex = -1,
          leftLength = partials.length,
          args = Array(leftLength + argsLength),
          fn = (this && this !== root$5 && this instanceof wrapper) ? Ctor : func;

      while (++leftIndex < leftLength) {
        args[leftIndex] = partials[leftIndex];
      }
      while (argsLength--) {
        args[leftIndex++] = arguments[++argsIndex];
      }
      return apply$1(fn, isBind ? thisArg : this, args);
    }
    return wrapper;
  }

  var _createPartial = createPartial$1;

  var composeArgs = _composeArgs,
      composeArgsRight = _composeArgsRight,
      replaceHolders = _replaceHolders;

  /** Used as the internal argument placeholder. */
  var PLACEHOLDER = '__lodash_placeholder__';

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG$1 = 1,
      WRAP_BIND_KEY_FLAG$1 = 2,
      WRAP_CURRY_BOUND_FLAG = 4,
      WRAP_CURRY_FLAG$2 = 8,
      WRAP_ARY_FLAG$1 = 128,
      WRAP_REARG_FLAG$1 = 256;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMin = Math.min;

  /**
   * Merges the function metadata of `source` into `data`.
   *
   * Merging metadata reduces the number of wrappers used to invoke a function.
   * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
   * may be applied regardless of execution order. Methods like `_.ary` and
   * `_.rearg` modify function arguments, making the order in which they are
   * executed important, preventing the merging of metadata. However, we make
   * an exception for a safe combined case where curried functions have `_.ary`
   * and or `_.rearg` applied.
   *
   * @private
   * @param {Array} data The destination metadata.
   * @param {Array} source The source metadata.
   * @returns {Array} Returns `data`.
   */
  function mergeData$1(data, source) {
    var bitmask = data[1],
        srcBitmask = source[1],
        newBitmask = bitmask | srcBitmask,
        isCommon = newBitmask < (WRAP_BIND_FLAG$1 | WRAP_BIND_KEY_FLAG$1 | WRAP_ARY_FLAG$1);

    var isCombo =
      ((srcBitmask == WRAP_ARY_FLAG$1) && (bitmask == WRAP_CURRY_FLAG$2)) ||
      ((srcBitmask == WRAP_ARY_FLAG$1) && (bitmask == WRAP_REARG_FLAG$1) && (data[7].length <= source[8])) ||
      ((srcBitmask == (WRAP_ARY_FLAG$1 | WRAP_REARG_FLAG$1)) && (source[7].length <= source[8]) && (bitmask == WRAP_CURRY_FLAG$2));

    // Exit early if metadata can't be merged.
    if (!(isCommon || isCombo)) {
      return data;
    }
    // Use source `thisArg` if available.
    if (srcBitmask & WRAP_BIND_FLAG$1) {
      data[2] = source[2];
      // Set when currying a bound function.
      newBitmask |= bitmask & WRAP_BIND_FLAG$1 ? 0 : WRAP_CURRY_BOUND_FLAG;
    }
    // Compose partial arguments.
    var value = source[3];
    if (value) {
      var partials = data[3];
      data[3] = partials ? composeArgs(partials, value, source[4]) : value;
      data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
    }
    // Compose partial right arguments.
    value = source[5];
    if (value) {
      partials = data[5];
      data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
      data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
    }
    // Use source `argPos` if available.
    value = source[7];
    if (value) {
      data[7] = value;
    }
    // Use source `ary` if it's smaller.
    if (srcBitmask & WRAP_ARY_FLAG$1) {
      data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
    }
    // Use source `arity` if one is not provided.
    if (data[9] == null) {
      data[9] = source[9];
    }
    // Use source `func` and merge bitmasks.
    data[0] = source[0];
    data[1] = newBitmask;

    return data;
  }

  var _mergeData = mergeData$1;

  /** Used to match a single whitespace character. */

  var reWhitespace = /\s/;

  /**
   * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the last non-whitespace character.
   */
  function trimmedEndIndex$1(string) {
    var index = string.length;

    while (index-- && reWhitespace.test(string.charAt(index))) {}
    return index;
  }

  var _trimmedEndIndex = trimmedEndIndex$1;

  var trimmedEndIndex = _trimmedEndIndex;

  /** Used to match leading whitespace. */
  var reTrimStart = /^\s+/;

  /**
   * The base implementation of `_.trim`.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} Returns the trimmed string.
   */
  function baseTrim$1(string) {
    return string
      ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
      : string;
  }

  var _baseTrim = baseTrim$1;

  var baseGetTag$5 = _baseGetTag,
      isObjectLike$9 = isObjectLike_1;

  /** `Object#toString` result references. */
  var symbolTag$3 = '[object Symbol]';

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol$5(value) {
    return typeof value == 'symbol' ||
      (isObjectLike$9(value) && baseGetTag$5(value) == symbolTag$3);
  }

  var isSymbol_1 = isSymbol$5;

  var baseTrim = _baseTrim,
      isObject$3 = isObject_1,
      isSymbol$4 = isSymbol_1;

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber$1(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol$4(value)) {
      return NAN;
    }
    if (isObject$3(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject$3(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = baseTrim(value);
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var toNumber_1 = toNumber$1;

  var toNumber = toNumber_1;

  /** Used as references for various `Number` constants. */
  var INFINITY$2 = 1 / 0,
      MAX_INTEGER = 1.7976931348623157e+308;

  /**
   * Converts `value` to a finite number.
   *
   * @static
   * @memberOf _
   * @since 4.12.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted number.
   * @example
   *
   * _.toFinite(3.2);
   * // => 3.2
   *
   * _.toFinite(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toFinite(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toFinite('3.2');
   * // => 3.2
   */
  function toFinite$1(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY$2 || value === -INFINITY$2) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }

  var toFinite_1 = toFinite$1;

  var toFinite = toFinite_1;

  /**
   * Converts `value` to an integer.
   *
   * **Note:** This method is loosely based on
   * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3.2);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3.2');
   * // => 3
   */
  function toInteger$1(value) {
    var result = toFinite(value),
        remainder = result % 1;

    return result === result ? (remainder ? result - remainder : result) : 0;
  }

  var toInteger_1 = toInteger$1;

  var baseSetData = _baseSetData,
      createBind = _createBind,
      createCurry = _createCurry,
      createHybrid = _createHybrid,
      createPartial = _createPartial,
      getData = _getData,
      mergeData = _mergeData,
      setData = _setData,
      setWrapToString = _setWrapToString,
      toInteger = toInteger_1;

  /** Error message constants. */
  var FUNC_ERROR_TEXT$1 = 'Expected a function';

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG = 1,
      WRAP_BIND_KEY_FLAG = 2,
      WRAP_CURRY_FLAG$1 = 8,
      WRAP_CURRY_RIGHT_FLAG = 16,
      WRAP_PARTIAL_FLAG = 32,
      WRAP_PARTIAL_RIGHT_FLAG = 64;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax$1 = Math.max;

  /**
   * Creates a function that either curries or invokes `func` with optional
   * `this` binding and partially applied arguments.
   *
   * @private
   * @param {Function|string} func The function or method name to wrap.
   * @param {number} bitmask The bitmask flags.
   *    1 - `_.bind`
   *    2 - `_.bindKey`
   *    4 - `_.curry` or `_.curryRight` of a bound function
   *    8 - `_.curry`
   *   16 - `_.curryRight`
   *   32 - `_.partial`
   *   64 - `_.partialRight`
   *  128 - `_.rearg`
   *  256 - `_.ary`
   *  512 - `_.flip`
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {Array} [partials] The arguments to be partially applied.
   * @param {Array} [holders] The `partials` placeholder indexes.
   * @param {Array} [argPos] The argument positions of the new function.
   * @param {number} [ary] The arity cap of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createWrap$3(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
    var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
    if (!isBindKey && typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$1);
    }
    var length = partials ? partials.length : 0;
    if (!length) {
      bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
      partials = holders = undefined;
    }
    ary = ary === undefined ? ary : nativeMax$1(toInteger(ary), 0);
    arity = arity === undefined ? arity : toInteger(arity);
    length -= holders ? holders.length : 0;

    if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
      var partialsRight = partials,
          holdersRight = holders;

      partials = holders = undefined;
    }
    var data = isBindKey ? undefined : getData(func);

    var newData = [
      func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
      argPos, ary, arity
    ];

    if (data) {
      mergeData(newData, data);
    }
    func = newData[0];
    bitmask = newData[1];
    thisArg = newData[2];
    partials = newData[3];
    holders = newData[4];
    arity = newData[9] = newData[9] === undefined
      ? (isBindKey ? 0 : func.length)
      : nativeMax$1(newData[9] - length, 0);

    if (!arity && bitmask & (WRAP_CURRY_FLAG$1 | WRAP_CURRY_RIGHT_FLAG)) {
      bitmask &= ~(WRAP_CURRY_FLAG$1 | WRAP_CURRY_RIGHT_FLAG);
    }
    if (!bitmask || bitmask == WRAP_BIND_FLAG) {
      var result = createBind(func, bitmask, thisArg);
    } else if (bitmask == WRAP_CURRY_FLAG$1 || bitmask == WRAP_CURRY_RIGHT_FLAG) {
      result = createCurry(func, bitmask, arity);
    } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
      result = createPartial(func, bitmask, thisArg, partials);
    } else {
      result = createHybrid.apply(undefined, newData);
    }
    var setter = data ? baseSetData : setData;
    return setWrapToString(setter(result, newData), func, bitmask);
  }

  var _createWrap = createWrap$3;

  var createWrap$2 = _createWrap;

  /** Used to compose bitmasks for function metadata. */
  var WRAP_ARY_FLAG = 128;

  /**
   * Creates a function that invokes `func`, with up to `n` arguments,
   * ignoring any additional arguments.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Function
   * @param {Function} func The function to cap arguments for.
   * @param {number} [n=func.length] The arity cap.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Function} Returns the new capped function.
   * @example
   *
   * _.map(['6', '8', '10'], _.ary(parseInt, 1));
   * // => [6, 8, 10]
   */
  function ary(func, n, guard) {
    n = guard ? undefined : n;
    n = (func && n == null) ? func.length : n;
    return createWrap$2(func, WRAP_ARY_FLAG, undefined, undefined, undefined, undefined, n);
  }

  var ary_1 = ary;

  var defineProperty = _defineProperty;

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue$2(object, key, value) {
    if (key == '__proto__' && defineProperty) {
      defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  var _baseAssignValue = baseAssignValue$2;

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */

  function eq$3(value, other) {
    return value === other || (value !== value && other !== other);
  }

  var eq_1 = eq$3;

  var baseAssignValue$1 = _baseAssignValue,
      eq$2 = eq_1;

  /** Used for built-in method references. */
  var objectProto$c = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$a = objectProto$c.hasOwnProperty;

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue$2(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$a.call(object, key) && eq$2(objValue, value)) ||
        (value === undefined && !(key in object))) {
      baseAssignValue$1(object, key, value);
    }
  }

  var _assignValue = assignValue$2;

  var assignValue$1 = _assignValue,
      baseAssignValue = _baseAssignValue;

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject$4(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue$1(object, key, newValue);
      }
    }
    return object;
  }

  var _copyObject = copyObject$4;

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */

  function baseTimes$1(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  var _baseTimes = baseTimes$1;

  var baseGetTag$4 = _baseGetTag,
      isObjectLike$8 = isObjectLike_1;

  /** `Object#toString` result references. */
  var argsTag$3 = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments$1(value) {
    return isObjectLike$8(value) && baseGetTag$4(value) == argsTag$3;
  }

  var _baseIsArguments = baseIsArguments$1;

  var baseIsArguments = _baseIsArguments,
      isObjectLike$7 = isObjectLike_1;

  /** Used for built-in method references. */
  var objectProto$b = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable$1 = objectProto$b.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments$3 = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
    return isObjectLike$7(value) && hasOwnProperty$9.call(value, 'callee') &&
      !propertyIsEnumerable$1.call(value, 'callee');
  };

  var isArguments_1 = isArguments$3;

  var isBuffer$3 = {exports: {}};

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */

  function stubFalse() {
    return false;
  }

  var stubFalse_1 = stubFalse;

  (function (module, exports) {
  	var root = _root,
  	    stubFalse = stubFalse_1;

  	/** Detect free variable `exports`. */
  	var freeExports = exports && !exports.nodeType && exports;

  	/** Detect free variable `module`. */
  	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  	/** Detect the popular CommonJS extension `module.exports`. */
  	var moduleExports = freeModule && freeModule.exports === freeExports;

  	/** Built-in value references. */
  	var Buffer = moduleExports ? root.Buffer : undefined;

  	/* Built-in method references for those with the same name as other `lodash` methods. */
  	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

  	/**
  	 * Checks if `value` is a buffer.
  	 *
  	 * @static
  	 * @memberOf _
  	 * @since 4.3.0
  	 * @category Lang
  	 * @param {*} value The value to check.
  	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
  	 * @example
  	 *
  	 * _.isBuffer(new Buffer(2));
  	 * // => true
  	 *
  	 * _.isBuffer(new Uint8Array(2));
  	 * // => false
  	 */
  	var isBuffer = nativeIsBuffer || stubFalse;

  	module.exports = isBuffer; 
  } (isBuffer$3, isBuffer$3.exports));

  var isBufferExports = isBuffer$3.exports;

  /** Used as references for various `Number` constants. */

  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength$3(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  var isLength_1 = isLength$3;

  var baseGetTag$3 = _baseGetTag,
      isLength$2 = isLength_1,
      isObjectLike$6 = isObjectLike_1;

  /** `Object#toString` result references. */
  var argsTag$2 = '[object Arguments]',
      arrayTag$2 = '[object Array]',
      boolTag$3 = '[object Boolean]',
      dateTag$3 = '[object Date]',
      errorTag$3 = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag$5 = '[object Map]',
      numberTag$3 = '[object Number]',
      objectTag$4 = '[object Object]',
      regexpTag$3 = '[object RegExp]',
      setTag$5 = '[object Set]',
      stringTag$3 = '[object String]',
      weakMapTag$3 = '[object WeakMap]';

  var arrayBufferTag$3 = '[object ArrayBuffer]',
      dataViewTag$4 = '[object DataView]',
      float32Tag$2 = '[object Float32Array]',
      float64Tag$2 = '[object Float64Array]',
      int8Tag$2 = '[object Int8Array]',
      int16Tag$2 = '[object Int16Array]',
      int32Tag$2 = '[object Int32Array]',
      uint8Tag$2 = '[object Uint8Array]',
      uint8ClampedTag$2 = '[object Uint8ClampedArray]',
      uint16Tag$2 = '[object Uint16Array]',
      uint32Tag$2 = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] =
  typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] =
  typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] =
  typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] =
  typedArrayTags[uint32Tag$2] = true;
  typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$2] =
  typedArrayTags[arrayBufferTag$3] = typedArrayTags[boolTag$3] =
  typedArrayTags[dataViewTag$4] = typedArrayTags[dateTag$3] =
  typedArrayTags[errorTag$3] = typedArrayTags[funcTag$1] =
  typedArrayTags[mapTag$5] = typedArrayTags[numberTag$3] =
  typedArrayTags[objectTag$4] = typedArrayTags[regexpTag$3] =
  typedArrayTags[setTag$5] = typedArrayTags[stringTag$3] =
  typedArrayTags[weakMapTag$3] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray$1(value) {
    return isObjectLike$6(value) &&
      isLength$2(value.length) && !!typedArrayTags[baseGetTag$3(value)];
  }

  var _baseIsTypedArray = baseIsTypedArray$1;

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */

  function baseUnary$3(func) {
    return function(value) {
      return func(value);
    };
  }

  var _baseUnary = baseUnary$3;

  var _nodeUtil = {exports: {}};

  (function (module, exports) {
  	var freeGlobal = _freeGlobal;

  	/** Detect free variable `exports`. */
  	var freeExports = exports && !exports.nodeType && exports;

  	/** Detect free variable `module`. */
  	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  	/** Detect the popular CommonJS extension `module.exports`. */
  	var moduleExports = freeModule && freeModule.exports === freeExports;

  	/** Detect free variable `process` from Node.js. */
  	var freeProcess = moduleExports && freeGlobal.process;

  	/** Used to access faster Node.js helpers. */
  	var nodeUtil = (function() {
  	  try {
  	    // Use `util.types` for Node.js 10+.
  	    var types = freeModule && freeModule.require && freeModule.require('util').types;

  	    if (types) {
  	      return types;
  	    }

  	    // Legacy `process.binding('util')` for Node.js < 10.
  	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  	  } catch (e) {}
  	}());

  	module.exports = nodeUtil; 
  } (_nodeUtil, _nodeUtil.exports));

  var _nodeUtilExports = _nodeUtil.exports;

  var baseIsTypedArray = _baseIsTypedArray,
      baseUnary$2 = _baseUnary,
      nodeUtil$2 = _nodeUtilExports;

  /* Node.js helper references. */
  var nodeIsTypedArray = nodeUtil$2 && nodeUtil$2.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray$2 = nodeIsTypedArray ? baseUnary$2(nodeIsTypedArray) : baseIsTypedArray;

  var isTypedArray_1 = isTypedArray$2;

  var baseTimes = _baseTimes,
      isArguments$2 = isArguments_1,
      isArray$b = isArray_1,
      isBuffer$2 = isBufferExports,
      isIndex$1 = _isIndex,
      isTypedArray$1 = isTypedArray_1;

  /** Used for built-in method references. */
  var objectProto$a = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys$2(value, inherited) {
    var isArr = isArray$b(value),
        isArg = !isArr && isArguments$2(value),
        isBuff = !isArr && !isArg && isBuffer$2(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray$1(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$8.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             isIndex$1(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  var _arrayLikeKeys = arrayLikeKeys$2;

  /** Used for built-in method references. */

  var objectProto$9 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype$3(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$9;

    return value === proto;
  }

  var _isPrototype = isPrototype$3;

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */

  function overArg$2(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  var _overArg = overArg$2;

  var overArg$1 = _overArg;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys$1 = overArg$1(Object.keys, Object);

  var _nativeKeys = nativeKeys$1;

  var isPrototype$2 = _isPrototype,
      nativeKeys = _nativeKeys;

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$8.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys$1(object) {
    if (!isPrototype$2(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$7.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeys = baseKeys$1;

  var isFunction$1 = isFunction_1,
      isLength$1 = isLength_1;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike$4(value) {
    return value != null && isLength$1(value.length) && !isFunction$1(value);
  }

  var isArrayLike_1 = isArrayLike$4;

  var arrayLikeKeys$1 = _arrayLikeKeys,
      baseKeys = _baseKeys,
      isArrayLike$3 = isArrayLike_1;

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys$5(object) {
    return isArrayLike$3(object) ? arrayLikeKeys$1(object) : baseKeys(object);
  }

  var keys_1 = keys$5;

  var copyObject$3 = _copyObject,
      keys$4 = keys_1;

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign$1(object, source) {
    return object && copyObject$3(source, keys$4(source), object);
  }

  var _baseAssign = baseAssign$1;

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */

  function listCacheClear$1() {
    this.__data__ = [];
    this.size = 0;
  }

  var _listCacheClear = listCacheClear$1;

  var eq$1 = eq_1;

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf$4(array, key) {
    var length = array.length;
    while (length--) {
      if (eq$1(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  var _assocIndexOf = assocIndexOf$4;

  var assocIndexOf$3 = _assocIndexOf;

  /** Used for built-in method references. */
  var arrayProto = Array.prototype;

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete$1(key) {
    var data = this.__data__,
        index = assocIndexOf$3(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  var _listCacheDelete = listCacheDelete$1;

  var assocIndexOf$2 = _assocIndexOf;

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet$1(key) {
    var data = this.__data__,
        index = assocIndexOf$2(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  var _listCacheGet = listCacheGet$1;

  var assocIndexOf$1 = _assocIndexOf;

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas$1(key) {
    return assocIndexOf$1(this.__data__, key) > -1;
  }

  var _listCacheHas = listCacheHas$1;

  var assocIndexOf = _assocIndexOf;

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet$1(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  var _listCacheSet = listCacheSet$1;

  var listCacheClear = _listCacheClear,
      listCacheDelete = _listCacheDelete,
      listCacheGet = _listCacheGet,
      listCacheHas = _listCacheHas,
      listCacheSet = _listCacheSet;

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache$4(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `ListCache`.
  ListCache$4.prototype.clear = listCacheClear;
  ListCache$4.prototype['delete'] = listCacheDelete;
  ListCache$4.prototype.get = listCacheGet;
  ListCache$4.prototype.has = listCacheHas;
  ListCache$4.prototype.set = listCacheSet;

  var _ListCache = ListCache$4;

  var ListCache$3 = _ListCache;

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear$1() {
    this.__data__ = new ListCache$3;
    this.size = 0;
  }

  var _stackClear = stackClear$1;

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */

  function stackDelete$1(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  var _stackDelete = stackDelete$1;

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */

  function stackGet$1(key) {
    return this.__data__.get(key);
  }

  var _stackGet = stackGet$1;

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */

  function stackHas$1(key) {
    return this.__data__.has(key);
  }

  var _stackHas = stackHas$1;

  var getNative$4 = _getNative,
      root$4 = _root;

  /* Built-in method references that are verified to be native. */
  var Map$4 = getNative$4(root$4, 'Map');

  var _Map = Map$4;

  var getNative$3 = _getNative;

  /* Built-in method references that are verified to be native. */
  var nativeCreate$4 = getNative$3(Object, 'create');

  var _nativeCreate = nativeCreate$4;

  var nativeCreate$3 = _nativeCreate;

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear$1() {
    this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
    this.size = 0;
  }

  var _hashClear = hashClear$1;

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */

  function hashDelete$1(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  var _hashDelete = hashDelete$1;

  var nativeCreate$2 = _nativeCreate;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet$1(key) {
    var data = this.__data__;
    if (nativeCreate$2) {
      var result = data[key];
      return result === HASH_UNDEFINED$2 ? undefined : result;
    }
    return hasOwnProperty$6.call(data, key) ? data[key] : undefined;
  }

  var _hashGet = hashGet$1;

  var nativeCreate$1 = _nativeCreate;

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas$1(key) {
    var data = this.__data__;
    return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$5.call(data, key);
  }

  var _hashHas = hashHas$1;

  var nativeCreate = _nativeCreate;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet$1(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
    return this;
  }

  var _hashSet = hashSet$1;

  var hashClear = _hashClear,
      hashDelete = _hashDelete,
      hashGet = _hashGet,
      hashHas = _hashHas,
      hashSet = _hashSet;

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash$1(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `Hash`.
  Hash$1.prototype.clear = hashClear;
  Hash$1.prototype['delete'] = hashDelete;
  Hash$1.prototype.get = hashGet;
  Hash$1.prototype.has = hashHas;
  Hash$1.prototype.set = hashSet;

  var _Hash = Hash$1;

  var Hash = _Hash,
      ListCache$2 = _ListCache,
      Map$3 = _Map;

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear$1() {
    this.size = 0;
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map$3 || ListCache$2),
      'string': new Hash
    };
  }

  var _mapCacheClear = mapCacheClear$1;

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */

  function isKeyable$1(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  var _isKeyable = isKeyable$1;

  var isKeyable = _isKeyable;

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData$4(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  var _getMapData = getMapData$4;

  var getMapData$3 = _getMapData;

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete$1(key) {
    var result = getMapData$3(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  var _mapCacheDelete = mapCacheDelete$1;

  var getMapData$2 = _getMapData;

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet$1(key) {
    return getMapData$2(this, key).get(key);
  }

  var _mapCacheGet = mapCacheGet$1;

  var getMapData$1 = _getMapData;

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas$1(key) {
    return getMapData$1(this, key).has(key);
  }

  var _mapCacheHas = mapCacheHas$1;

  var getMapData = _getMapData;

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet$1(key, value) {
    var data = getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  var _mapCacheSet = mapCacheSet$1;

  var mapCacheClear = _mapCacheClear,
      mapCacheDelete = _mapCacheDelete,
      mapCacheGet = _mapCacheGet,
      mapCacheHas = _mapCacheHas,
      mapCacheSet = _mapCacheSet;

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache$3(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `MapCache`.
  MapCache$3.prototype.clear = mapCacheClear;
  MapCache$3.prototype['delete'] = mapCacheDelete;
  MapCache$3.prototype.get = mapCacheGet;
  MapCache$3.prototype.has = mapCacheHas;
  MapCache$3.prototype.set = mapCacheSet;

  var _MapCache = MapCache$3;

  var ListCache$1 = _ListCache,
      Map$2 = _Map,
      MapCache$2 = _MapCache;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */
  function stackSet$1(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache$1) {
      var pairs = data.__data__;
      if (!Map$2 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache$2(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  var _stackSet = stackSet$1;

  var ListCache = _ListCache,
      stackClear = _stackClear,
      stackDelete = _stackDelete,
      stackGet = _stackGet,
      stackHas = _stackHas,
      stackSet = _stackSet;

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Stack$3(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }

  // Add methods to `Stack`.
  Stack$3.prototype.clear = stackClear;
  Stack$3.prototype['delete'] = stackDelete;
  Stack$3.prototype.get = stackGet;
  Stack$3.prototype.has = stackHas;
  Stack$3.prototype.set = stackSet;

  var _Stack = Stack$3;

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */

  function nativeKeysIn$1(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  var _nativeKeysIn = nativeKeysIn$1;

  var isObject$2 = isObject_1,
      isPrototype$1 = _isPrototype,
      nativeKeysIn = _nativeKeysIn;

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn$1(object) {
    if (!isObject$2(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype$1(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$4.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeysIn = baseKeysIn$1;

  var arrayLikeKeys = _arrayLikeKeys,
      baseKeysIn = _baseKeysIn,
      isArrayLike$2 = isArrayLike_1;

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn$3(object) {
    return isArrayLike$2(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }

  var keysIn_1 = keysIn$3;

  var copyObject$2 = _copyObject,
      keysIn$2 = keysIn_1;

  /**
   * The base implementation of `_.assignIn` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssignIn$1(object, source) {
    return object && copyObject$2(source, keysIn$2(source), object);
  }

  var _baseAssignIn = baseAssignIn$1;

  var _cloneBuffer = {exports: {}};

  (function (module, exports) {
  	var root = _root;

  	/** Detect free variable `exports`. */
  	var freeExports = exports && !exports.nodeType && exports;

  	/** Detect free variable `module`. */
  	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  	/** Detect the popular CommonJS extension `module.exports`. */
  	var moduleExports = freeModule && freeModule.exports === freeExports;

  	/** Built-in value references. */
  	var Buffer = moduleExports ? root.Buffer : undefined,
  	    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

  	/**
  	 * Creates a clone of  `buffer`.
  	 *
  	 * @private
  	 * @param {Buffer} buffer The buffer to clone.
  	 * @param {boolean} [isDeep] Specify a deep clone.
  	 * @returns {Buffer} Returns the cloned buffer.
  	 */
  	function cloneBuffer(buffer, isDeep) {
  	  if (isDeep) {
  	    return buffer.slice();
  	  }
  	  var length = buffer.length,
  	      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  	  buffer.copy(result);
  	  return result;
  	}

  	module.exports = cloneBuffer; 
  } (_cloneBuffer, _cloneBuffer.exports));

  var _cloneBufferExports = _cloneBuffer.exports;

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */

  function arrayFilter$1(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  var _arrayFilter = arrayFilter$1;

  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */

  function stubArray$2() {
    return [];
  }

  var stubArray_1 = stubArray$2;

  var arrayFilter = _arrayFilter,
      stubArray$1 = stubArray_1;

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$4.propertyIsEnumerable;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols$3 = !nativeGetSymbols$1 ? stubArray$1 : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols$1(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };

  var _getSymbols = getSymbols$3;

  var copyObject$1 = _copyObject,
      getSymbols$2 = _getSymbols;

  /**
   * Copies own symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols$1(source, object) {
    return copyObject$1(source, getSymbols$2(source), object);
  }

  var _copySymbols = copySymbols$1;

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */

  function arrayPush$3(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  var _arrayPush = arrayPush$3;

  var overArg = _overArg;

  /** Built-in value references. */
  var getPrototype$3 = overArg(Object.getPrototypeOf, Object);

  var _getPrototype = getPrototype$3;

  var arrayPush$2 = _arrayPush,
      getPrototype$2 = _getPrototype,
      getSymbols$1 = _getSymbols,
      stubArray = stubArray_1;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own and inherited enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbolsIn$2 = !nativeGetSymbols ? stubArray : function(object) {
    var result = [];
    while (object) {
      arrayPush$2(result, getSymbols$1(object));
      object = getPrototype$2(object);
    }
    return result;
  };

  var _getSymbolsIn = getSymbolsIn$2;

  var copyObject = _copyObject,
      getSymbolsIn$1 = _getSymbolsIn;

  /**
   * Copies own and inherited symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbolsIn$1(source, object) {
    return copyObject(source, getSymbolsIn$1(source), object);
  }

  var _copySymbolsIn = copySymbolsIn$1;

  var arrayPush$1 = _arrayPush,
      isArray$a = isArray_1;

  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function baseGetAllKeys$2(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray$a(object) ? result : arrayPush$1(result, symbolsFunc(object));
  }

  var _baseGetAllKeys = baseGetAllKeys$2;

  var baseGetAllKeys$1 = _baseGetAllKeys,
      getSymbols = _getSymbols,
      keys$3 = keys_1;

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeys$2(object) {
    return baseGetAllKeys$1(object, keys$3, getSymbols);
  }

  var _getAllKeys = getAllKeys$2;

  var baseGetAllKeys = _baseGetAllKeys,
      getSymbolsIn = _getSymbolsIn,
      keysIn$1 = keysIn_1;

  /**
   * Creates an array of own and inherited enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeysIn$1(object) {
    return baseGetAllKeys(object, keysIn$1, getSymbolsIn);
  }

  var _getAllKeysIn = getAllKeysIn$1;

  var getNative$2 = _getNative,
      root$3 = _root;

  /* Built-in method references that are verified to be native. */
  var DataView$1 = getNative$2(root$3, 'DataView');

  var _DataView = DataView$1;

  var getNative$1 = _getNative,
      root$2 = _root;

  /* Built-in method references that are verified to be native. */
  var Promise$2 = getNative$1(root$2, 'Promise');

  var _Promise = Promise$2;

  var getNative = _getNative,
      root$1 = _root;

  /* Built-in method references that are verified to be native. */
  var Set$2 = getNative(root$1, 'Set');

  var _Set = Set$2;

  var DataView = _DataView,
      Map$1 = _Map,
      Promise$1 = _Promise,
      Set$1 = _Set,
      WeakMap$1 = _WeakMap,
      baseGetTag$2 = _baseGetTag,
      toSource = _toSource;

  /** `Object#toString` result references. */
  var mapTag$4 = '[object Map]',
      objectTag$3 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$4 = '[object Set]',
      weakMapTag$2 = '[object WeakMap]';

  var dataViewTag$3 = '[object DataView]';

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = toSource(DataView),
      mapCtorString = toSource(Map$1),
      promiseCtorString = toSource(Promise$1),
      setCtorString = toSource(Set$1),
      weakMapCtorString = toSource(WeakMap$1);

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag$5 = baseGetTag$2;

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if ((DataView && getTag$5(new DataView(new ArrayBuffer(1))) != dataViewTag$3) ||
      (Map$1 && getTag$5(new Map$1) != mapTag$4) ||
      (Promise$1 && getTag$5(Promise$1.resolve()) != promiseTag) ||
      (Set$1 && getTag$5(new Set$1) != setTag$4) ||
      (WeakMap$1 && getTag$5(new WeakMap$1) != weakMapTag$2)) {
    getTag$5 = function(value) {
      var result = baseGetTag$2(value),
          Ctor = result == objectTag$3 ? value.constructor : undefined,
          ctorString = Ctor ? toSource(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString: return dataViewTag$3;
          case mapCtorString: return mapTag$4;
          case promiseCtorString: return promiseTag;
          case setCtorString: return setTag$4;
          case weakMapCtorString: return weakMapTag$2;
        }
      }
      return result;
    };
  }

  var _getTag = getTag$5;

  /** Used for built-in method references. */

  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray$1(array) {
    var length = array.length,
        result = new array.constructor(length);

    // Add properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty$3.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  var _initCloneArray = initCloneArray$1;

  var root = _root;

  /** Built-in value references. */
  var Uint8Array$3 = root.Uint8Array;

  var _Uint8Array = Uint8Array$3;

  var Uint8Array$2 = _Uint8Array;

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer$3(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array$2(result).set(new Uint8Array$2(arrayBuffer));
    return result;
  }

  var _cloneArrayBuffer = cloneArrayBuffer$3;

  var cloneArrayBuffer$2 = _cloneArrayBuffer;

  /**
   * Creates a clone of `dataView`.
   *
   * @private
   * @param {Object} dataView The data view to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned data view.
   */
  function cloneDataView$1(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer$2(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }

  var _cloneDataView = cloneDataView$1;

  /** Used to match `RegExp` flags from their coerced string values. */

  var reFlags = /\w*$/;

  /**
   * Creates a clone of `regexp`.
   *
   * @private
   * @param {Object} regexp The regexp to clone.
   * @returns {Object} Returns the cloned regexp.
   */
  function cloneRegExp$1(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }

  var _cloneRegExp = cloneRegExp$1;

  var Symbol$4 = _Symbol;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto$2 = Symbol$4 ? Symbol$4.prototype : undefined,
      symbolValueOf$1 = symbolProto$2 ? symbolProto$2.valueOf : undefined;

  /**
   * Creates a clone of the `symbol` object.
   *
   * @private
   * @param {Object} symbol The symbol object to clone.
   * @returns {Object} Returns the cloned symbol object.
   */
  function cloneSymbol$1(symbol) {
    return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {};
  }

  var _cloneSymbol = cloneSymbol$1;

  var cloneArrayBuffer$1 = _cloneArrayBuffer;

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray$1(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer$1(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  var _cloneTypedArray = cloneTypedArray$1;

  var cloneArrayBuffer = _cloneArrayBuffer,
      cloneDataView = _cloneDataView,
      cloneRegExp = _cloneRegExp,
      cloneSymbol = _cloneSymbol,
      cloneTypedArray = _cloneTypedArray;

  /** `Object#toString` result references. */
  var boolTag$2 = '[object Boolean]',
      dateTag$2 = '[object Date]',
      mapTag$3 = '[object Map]',
      numberTag$2 = '[object Number]',
      regexpTag$2 = '[object RegExp]',
      setTag$3 = '[object Set]',
      stringTag$2 = '[object String]',
      symbolTag$2 = '[object Symbol]';

  var arrayBufferTag$2 = '[object ArrayBuffer]',
      dataViewTag$2 = '[object DataView]',
      float32Tag$1 = '[object Float32Array]',
      float64Tag$1 = '[object Float64Array]',
      int8Tag$1 = '[object Int8Array]',
      int16Tag$1 = '[object Int16Array]',
      int32Tag$1 = '[object Int32Array]',
      uint8Tag$1 = '[object Uint8Array]',
      uint8ClampedTag$1 = '[object Uint8ClampedArray]',
      uint16Tag$1 = '[object Uint16Array]',
      uint32Tag$1 = '[object Uint32Array]';

  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag$1(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag$2:
        return cloneArrayBuffer(object);

      case boolTag$2:
      case dateTag$2:
        return new Ctor(+object);

      case dataViewTag$2:
        return cloneDataView(object, isDeep);

      case float32Tag$1: case float64Tag$1:
      case int8Tag$1: case int16Tag$1: case int32Tag$1:
      case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
        return cloneTypedArray(object, isDeep);

      case mapTag$3:
        return new Ctor;

      case numberTag$2:
      case stringTag$2:
        return new Ctor(object);

      case regexpTag$2:
        return cloneRegExp(object);

      case setTag$3:
        return new Ctor;

      case symbolTag$2:
        return cloneSymbol(object);
    }
  }

  var _initCloneByTag = initCloneByTag$1;

  var baseCreate = _baseCreate,
      getPrototype$1 = _getPrototype,
      isPrototype = _isPrototype;

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject$1(object) {
    return (typeof object.constructor == 'function' && !isPrototype(object))
      ? baseCreate(getPrototype$1(object))
      : {};
  }

  var _initCloneObject = initCloneObject$1;

  var getTag$4 = _getTag,
      isObjectLike$5 = isObjectLike_1;

  /** `Object#toString` result references. */
  var mapTag$2 = '[object Map]';

  /**
   * The base implementation of `_.isMap` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   */
  function baseIsMap$1(value) {
    return isObjectLike$5(value) && getTag$4(value) == mapTag$2;
  }

  var _baseIsMap = baseIsMap$1;

  var baseIsMap = _baseIsMap,
      baseUnary$1 = _baseUnary,
      nodeUtil$1 = _nodeUtilExports;

  /* Node.js helper references. */
  var nodeIsMap = nodeUtil$1 && nodeUtil$1.isMap;

  /**
   * Checks if `value` is classified as a `Map` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   * @example
   *
   * _.isMap(new Map);
   * // => true
   *
   * _.isMap(new WeakMap);
   * // => false
   */
  var isMap$1 = nodeIsMap ? baseUnary$1(nodeIsMap) : baseIsMap;

  var isMap_1 = isMap$1;

  var getTag$3 = _getTag,
      isObjectLike$4 = isObjectLike_1;

  /** `Object#toString` result references. */
  var setTag$2 = '[object Set]';

  /**
   * The base implementation of `_.isSet` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   */
  function baseIsSet$1(value) {
    return isObjectLike$4(value) && getTag$3(value) == setTag$2;
  }

  var _baseIsSet = baseIsSet$1;

  var baseIsSet = _baseIsSet,
      baseUnary = _baseUnary,
      nodeUtil = _nodeUtilExports;

  /* Node.js helper references. */
  var nodeIsSet = nodeUtil && nodeUtil.isSet;

  /**
   * Checks if `value` is classified as a `Set` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   * @example
   *
   * _.isSet(new Set);
   * // => true
   *
   * _.isSet(new WeakSet);
   * // => false
   */
  var isSet$1 = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

  var isSet_1 = isSet$1;

  var Stack$2 = _Stack,
      arrayEach = _arrayEach,
      assignValue = _assignValue,
      baseAssign = _baseAssign,
      baseAssignIn = _baseAssignIn,
      cloneBuffer = _cloneBufferExports,
      copyArray$1 = _copyArray,
      copySymbols = _copySymbols,
      copySymbolsIn = _copySymbolsIn,
      getAllKeys$1 = _getAllKeys,
      getAllKeysIn = _getAllKeysIn,
      getTag$2 = _getTag,
      initCloneArray = _initCloneArray,
      initCloneByTag = _initCloneByTag,
      initCloneObject = _initCloneObject,
      isArray$9 = isArray_1,
      isBuffer$1 = isBufferExports,
      isMap = isMap_1,
      isObject$1 = isObject_1,
      isSet = isSet_1,
      keys$2 = keys_1,
      keysIn = keysIn_1;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG$1 = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG$1 = 4;

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      errorTag$2 = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag$1 = '[object Map]',
      numberTag$1 = '[object Number]',
      objectTag$2 = '[object Object]',
      regexpTag$1 = '[object RegExp]',
      setTag$1 = '[object Set]',
      stringTag$1 = '[object String]',
      symbolTag$1 = '[object Symbol]',
      weakMapTag$1 = '[object WeakMap]';

  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$1 = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag$1] = cloneableTags[arrayTag$1] =
  cloneableTags[arrayBufferTag$1] = cloneableTags[dataViewTag$1] =
  cloneableTags[boolTag$1] = cloneableTags[dateTag$1] =
  cloneableTags[float32Tag] = cloneableTags[float64Tag] =
  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
  cloneableTags[int32Tag] = cloneableTags[mapTag$1] =
  cloneableTags[numberTag$1] = cloneableTags[objectTag$2] =
  cloneableTags[regexpTag$1] = cloneableTags[setTag$1] =
  cloneableTags[stringTag$1] = cloneableTags[symbolTag$1] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag$2] = cloneableTags[funcTag] =
  cloneableTags[weakMapTag$1] = false;

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Deep clone
   *  2 - Flatten inherited properties
   *  4 - Clone symbols
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone$2(value, bitmask, customizer, key, object, stack) {
    var result,
        isDeep = bitmask & CLONE_DEEP_FLAG$1,
        isFlat = bitmask & CLONE_FLAT_FLAG,
        isFull = bitmask & CLONE_SYMBOLS_FLAG$1;

    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject$1(value)) {
      return value;
    }
    var isArr = isArray$9(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray$1(value, result);
      }
    } else {
      var tag = getTag$2(value),
          isFunc = tag == funcTag || tag == genTag;

      if (isBuffer$1(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag$2 || tag == argsTag$1 || (isFunc && !object)) {
        result = (isFlat || isFunc) ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat
            ? copySymbolsIn(value, baseAssignIn(result, value))
            : copySymbols(value, baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag, isDeep);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack$2);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    if (isSet(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone$2(subValue, bitmask, customizer, subValue, value, stack));
      });
    } else if (isMap(value)) {
      value.forEach(function(subValue, key) {
        result.set(key, baseClone$2(subValue, bitmask, customizer, key, value, stack));
      });
    }

    var keysFunc = isFull
      ? (isFlat ? getAllKeysIn : getAllKeys$1)
      : (isFlat ? keysIn : keys$2);

    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function(subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      // Recursively populate clone (susceptible to call stack limits).
      assignValue(result, key, baseClone$2(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
  }

  var _baseClone = baseClone$2;

  var baseClone$1 = _baseClone;

  /** Used to compose bitmasks for cloning. */
  var CLONE_SYMBOLS_FLAG = 4;

  /**
   * Creates a shallow clone of `value`.
   *
   * **Note:** This method is loosely based on the
   * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
   * and supports cloning arrays, array buffers, booleans, date objects, maps,
   * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
   * arrays. The own enumerable properties of `arguments` objects are cloned
   * as plain objects. An empty object is returned for uncloneable values such
   * as error objects, functions, DOM nodes, and WeakMaps.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to clone.
   * @returns {*} Returns the cloned value.
   * @see _.cloneDeep
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var shallow = _.clone(objects);
   * console.log(shallow[0] === objects[0]);
   * // => true
   */
  function clone$2(value) {
    return baseClone$1(value, CLONE_SYMBOLS_FLAG);
  }

  var clone_1$2 = clone$2;

  var createWrap$1 = _createWrap;

  /** Used to compose bitmasks for function metadata. */
  var WRAP_CURRY_FLAG = 8;

  /**
   * Creates a function that accepts arguments of `func` and either invokes
   * `func` returning its result, if at least `arity` number of arguments have
   * been provided, or returns a function that accepts the remaining `func`
   * arguments, and so on. The arity of `func` may be specified if `func.length`
   * is not sufficient.
   *
   * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
   * may be used as a placeholder for provided arguments.
   *
   * **Note:** This method doesn't set the "length" property of curried functions.
   *
   * @static
   * @memberOf _
   * @since 2.0.0
   * @category Function
   * @param {Function} func The function to curry.
   * @param {number} [arity=func.length] The arity of `func`.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Function} Returns the new curried function.
   * @example
   *
   * var abc = function(a, b, c) {
   *   return [a, b, c];
   * };
   *
   * var curried = _.curry(abc);
   *
   * curried(1)(2)(3);
   * // => [1, 2, 3]
   *
   * curried(1, 2)(3);
   * // => [1, 2, 3]
   *
   * curried(1, 2, 3);
   * // => [1, 2, 3]
   *
   * // Curried with placeholders.
   * curried(1)(_, 3)(2);
   * // => [1, 2, 3]
   */
  function curry(func, arity, guard) {
    arity = guard ? undefined : arity;
    var result = createWrap$1(func, WRAP_CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
    result.placeholder = curry.placeholder;
    return result;
  }

  // Assign default placeholders.
  curry.placeholder = {};

  var curry_1 = curry;

  var baseGetTag$1 = _baseGetTag,
      getPrototype = _getPrototype,
      isObjectLike$3 = isObjectLike_1;

  /** `Object#toString` result references. */
  var objectTag$1 = '[object Object]';

  /** Used for built-in method references. */
  var funcProto = Function.prototype,
      objectProto$2 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

  /** Used to infer the `Object` constructor. */
  var objectCtorString = funcToString.call(Object);

  /**
   * Checks if `value` is a plain object, that is, an object created by the
   * `Object` constructor or one with a `[[Prototype]]` of `null`.
   *
   * @static
   * @memberOf _
   * @since 0.8.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * _.isPlainObject(new Foo);
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'x': 0, 'y': 0 });
   * // => true
   *
   * _.isPlainObject(Object.create(null));
   * // => true
   */
  function isPlainObject$1(value) {
    if (!isObjectLike$3(value) || baseGetTag$1(value) != objectTag$1) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty$2.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor &&
      funcToString.call(Ctor) == objectCtorString;
  }

  var isPlainObject_1 = isPlainObject$1;

  var baseGetTag = _baseGetTag,
      isObjectLike$2 = isObjectLike_1,
      isPlainObject = isPlainObject_1;

  /** `Object#toString` result references. */
  var domExcTag = '[object DOMException]',
      errorTag$1 = '[object Error]';

  /**
   * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
   * `SyntaxError`, `TypeError`, or `URIError` object.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
   * @example
   *
   * _.isError(new Error);
   * // => true
   *
   * _.isError(Error);
   * // => false
   */
  function isError(value) {
    if (!isObjectLike$2(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == errorTag$1 || tag == domExcTag ||
      (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
  }

  var isError_1 = isError;

  var getTag$1 = _getTag,
      isObjectLike$1 = isObjectLike_1;

  /** `Object#toString` result references. */
  var weakMapTag = '[object WeakMap]';

  /**
   * Checks if `value` is classified as a `WeakMap` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a weak map, else `false`.
   * @example
   *
   * _.isWeakMap(new WeakMap);
   * // => true
   *
   * _.isWeakMap(new Map);
   * // => false
   */
  function isWeakMap(value) {
    return isObjectLike$1(value) && getTag$1(value) == weakMapTag;
  }

  var isWeakMap_1 = isWeakMap;

  /** Used to stand-in for `undefined` hash values. */

  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /**
   * Adds `value` to the array cache.
   *
   * @private
   * @name add
   * @memberOf SetCache
   * @alias push
   * @param {*} value The value to cache.
   * @returns {Object} Returns the cache instance.
   */
  function setCacheAdd$1(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }

  var _setCacheAdd = setCacheAdd$1;

  /**
   * Checks if `value` is in the array cache.
   *
   * @private
   * @name has
   * @memberOf SetCache
   * @param {*} value The value to search for.
   * @returns {number} Returns `true` if `value` is found, else `false`.
   */

  function setCacheHas$1(value) {
    return this.__data__.has(value);
  }

  var _setCacheHas = setCacheHas$1;

  var MapCache$1 = _MapCache,
      setCacheAdd = _setCacheAdd,
      setCacheHas = _setCacheHas;

  /**
   *
   * Creates an array cache object to store unique values.
   *
   * @private
   * @constructor
   * @param {Array} [values] The values to cache.
   */
  function SetCache$1(values) {
    var index = -1,
        length = values == null ? 0 : values.length;

    this.__data__ = new MapCache$1;
    while (++index < length) {
      this.add(values[index]);
    }
  }

  // Add methods to `SetCache`.
  SetCache$1.prototype.add = SetCache$1.prototype.push = setCacheAdd;
  SetCache$1.prototype.has = setCacheHas;

  var _SetCache = SetCache$1;

  /**
   * A specialized version of `_.some` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */

  function arraySome$1(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  var _arraySome = arraySome$1;

  /**
   * Checks if a `cache` value for `key` exists.
   *
   * @private
   * @param {Object} cache The cache to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */

  function cacheHas$1(cache, key) {
    return cache.has(key);
  }

  var _cacheHas = cacheHas$1;

  var SetCache = _SetCache,
      arraySome = _arraySome,
      cacheHas = _cacheHas;

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$5 = 1,
      COMPARE_UNORDERED_FLAG$3 = 2;

  /**
   * A specialized version of `baseIsEqualDeep` for arrays with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Array} array The array to compare.
   * @param {Array} other The other array to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `array` and `other` objects.
   * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
   */
  function equalArrays$2(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5,
        arrLength = array.length,
        othLength = other.length;

    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    // Check that cyclic values are equal.
    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array;
    }
    var index = -1,
        result = true,
        seen = (bitmask & COMPARE_UNORDERED_FLAG$3) ? new SetCache : undefined;

    stack.set(array, other);
    stack.set(other, array);

    // Ignore non-index properties.
    while (++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index];

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, arrValue, index, other, array, stack)
          : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== undefined) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      // Recursively compare arrays (susceptible to call stack limits).
      if (seen) {
        if (!arraySome(other, function(othValue, othIndex) {
              if (!cacheHas(seen, othIndex) &&
                  (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
          result = false;
          break;
        }
      } else if (!(
            arrValue === othValue ||
              equalFunc(arrValue, othValue, bitmask, customizer, stack)
          )) {
        result = false;
        break;
      }
    }
    stack['delete'](array);
    stack['delete'](other);
    return result;
  }

  var _equalArrays = equalArrays$2;

  /**
   * Converts `map` to its key-value pairs.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the key-value pairs.
   */

  function mapToArray$1(map) {
    var index = -1,
        result = Array(map.size);

    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  var _mapToArray = mapToArray$1;

  /**
   * Converts `set` to an array of its values.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the values.
   */

  function setToArray$1(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }

  var _setToArray = setToArray$1;

  var Symbol$3 = _Symbol,
      Uint8Array$1 = _Uint8Array,
      eq = eq_1,
      equalArrays$1 = _equalArrays,
      mapToArray = _mapToArray,
      setToArray = _setToArray;

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$4 = 1,
      COMPARE_UNORDERED_FLAG$2 = 2;

  /** `Object#toString` result references. */
  var boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]';

  /** Used to convert symbols to primitives and strings. */
  var symbolProto$1 = Symbol$3 ? Symbol$3.prototype : undefined,
      symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

  /**
   * A specialized version of `baseIsEqualDeep` for comparing objects of
   * the same `toStringTag`.
   *
   * **Note:** This function only supports comparing values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {string} tag The `toStringTag` of the objects to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function equalByTag$1(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if ((object.byteLength != other.byteLength) ||
            (object.byteOffset != other.byteOffset)) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;

      case arrayBufferTag:
        if ((object.byteLength != other.byteLength) ||
            !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
          return false;
        }
        return true;

      case boolTag:
      case dateTag:
      case numberTag:
        // Coerce booleans to `1` or `0` and dates to milliseconds.
        // Invalid dates are coerced to `NaN`.
        return eq(+object, +other);

      case errorTag:
        return object.name == other.name && object.message == other.message;

      case regexpTag:
      case stringTag:
        // Coerce regexes to strings and treat strings, primitives and objects,
        // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
        // for more details.
        return object == (other + '');

      case mapTag:
        var convert = mapToArray;

      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
        convert || (convert = setToArray);

        if (object.size != other.size && !isPartial) {
          return false;
        }
        // Assume cyclic values are equal.
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG$2;

        // Recursively compare objects (susceptible to call stack limits).
        stack.set(object, other);
        var result = equalArrays$1(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack['delete'](object);
        return result;

      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other);
        }
    }
    return false;
  }

  var _equalByTag = equalByTag$1;

  var getAllKeys = _getAllKeys;

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$3 = 1;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

  /**
   * A specialized version of `baseIsEqualDeep` for objects with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function equalObjects$1(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3,
        objProps = getAllKeys(object),
        objLength = objProps.length,
        othProps = getAllKeys(other),
        othLength = othProps.length;

    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
        return false;
      }
    }
    // Check that cyclic values are equal.
    var objStacked = stack.get(object);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);

    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key],
          othValue = other[key];

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, objValue, key, other, object, stack)
          : customizer(objValue, othValue, key, object, other, stack);
      }
      // Recursively compare objects (susceptible to call stack limits).
      if (!(compared === undefined
            ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
            : compared
          )) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;

      // Non `Object` object instances with different constructors are not equal.
      if (objCtor != othCtor &&
          ('constructor' in object && 'constructor' in other) &&
          !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
            typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack['delete'](object);
    stack['delete'](other);
    return result;
  }

  var _equalObjects = equalObjects$1;

  var Stack$1 = _Stack,
      equalArrays = _equalArrays,
      equalByTag = _equalByTag,
      equalObjects = _equalObjects,
      getTag = _getTag,
      isArray$8 = isArray_1,
      isBuffer = isBufferExports,
      isTypedArray = isTypedArray_1;

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$2 = 1;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      objectTag = '[object Object]';

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * A specialized version of `baseIsEqual` for arrays and objects which performs
   * deep comparisons and tracks traversed objects enabling objects with circular
   * references to be compared.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} [stack] Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function baseIsEqualDeep$1(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray$8(object),
        othIsArr = isArray$8(other),
        objTag = objIsArr ? arrayTag : getTag(object),
        othTag = othIsArr ? arrayTag : getTag(other);

    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;

    var objIsObj = objTag == objectTag,
        othIsObj = othTag == objectTag,
        isSameTag = objTag == othTag;

    if (isSameTag && isBuffer(object)) {
      if (!isBuffer(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack$1);
      return (objIsArr || isTypedArray(object))
        ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
        : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other;

        stack || (stack = new Stack$1);
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack$1);
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }

  var _baseIsEqualDeep = baseIsEqualDeep$1;

  var baseIsEqualDeep = _baseIsEqualDeep,
      isObjectLike = isObjectLike_1;

  /**
   * The base implementation of `_.isEqual` which supports partial comparisons
   * and tracks traversed objects.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Unordered comparison
   *  2 - Partial comparison
   * @param {Function} [customizer] The function to customize comparisons.
   * @param {Object} [stack] Tracks traversed `value` and `other` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */
  function baseIsEqual$2(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$2, stack);
  }

  var _baseIsEqual = baseIsEqual$2;

  var Stack = _Stack,
      baseIsEqual$1 = _baseIsEqual;

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG$1 = 1,
      COMPARE_UNORDERED_FLAG$1 = 2;

  /**
   * The base implementation of `_.isMatch` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to inspect.
   * @param {Object} source The object of property values to match.
   * @param {Array} matchData The property names, values, and compare flags to match.
   * @param {Function} [customizer] The function to customize comparisons.
   * @returns {boolean} Returns `true` if `object` is a match, else `false`.
   */
  function baseIsMatch$1(object, source, matchData, customizer) {
    var index = matchData.length,
        length = index,
        noCustomizer = !customizer;

    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if ((noCustomizer && data[2])
            ? data[1] !== object[data[0]]
            : !(data[0] in object)
          ) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0],
          objValue = object[key],
          srcValue = data[1];

      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack;
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }
        if (!(result === undefined
              ? baseIsEqual$1(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack)
              : result
            )) {
          return false;
        }
      }
    }
    return true;
  }

  var _baseIsMatch = baseIsMatch$1;

  var isObject = isObject_1;

  /**
   * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` if suitable for strict
   *  equality comparisons, else `false`.
   */
  function isStrictComparable$2(value) {
    return value === value && !isObject(value);
  }

  var _isStrictComparable = isStrictComparable$2;

  var isStrictComparable$1 = _isStrictComparable,
      keys$1 = keys_1;

  /**
   * Gets the property names, values, and compare flags of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the match data of `object`.
   */
  function getMatchData$1(object) {
    var result = keys$1(object),
        length = result.length;

    while (length--) {
      var key = result[length],
          value = object[key];

      result[length] = [key, value, isStrictComparable$1(value)];
    }
    return result;
  }

  var _getMatchData = getMatchData$1;

  /**
   * A specialized version of `matchesProperty` for source values suitable
   * for strict equality comparisons, i.e. `===`.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @param {*} srcValue The value to match.
   * @returns {Function} Returns the new spec function.
   */

  function matchesStrictComparable$2(key, srcValue) {
    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === srcValue &&
        (srcValue !== undefined || (key in Object(object)));
    };
  }

  var _matchesStrictComparable = matchesStrictComparable$2;

  var baseIsMatch = _baseIsMatch,
      getMatchData = _getMatchData,
      matchesStrictComparable$1 = _matchesStrictComparable;

  /**
   * The base implementation of `_.matches` which doesn't clone `source`.
   *
   * @private
   * @param {Object} source The object of property values to match.
   * @returns {Function} Returns the new spec function.
   */
  function baseMatches$1(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable$1(matchData[0][0], matchData[0][1]);
    }
    return function(object) {
      return object === source || baseIsMatch(object, source, matchData);
    };
  }

  var _baseMatches = baseMatches$1;

  var isArray$7 = isArray_1,
      isSymbol$3 = isSymbol_1;

  /** Used to match property names within property paths. */
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/;

  /**
   * Checks if `value` is a property name and not a property path.
   *
   * @private
   * @param {*} value The value to check.
   * @param {Object} [object] The object to query keys on.
   * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
   */
  function isKey$3(value, object) {
    if (isArray$7(value)) {
      return false;
    }
    var type = typeof value;
    if (type == 'number' || type == 'symbol' || type == 'boolean' ||
        value == null || isSymbol$3(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
      (object != null && value in Object(object));
  }

  var _isKey = isKey$3;

  var MapCache = _MapCache;

  /** Error message constants. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /**
   * Creates a function that memoizes the result of `func`. If `resolver` is
   * provided, it determines the cache key for storing the result based on the
   * arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is used as the map cache key. The `func`
   * is invoked with the `this` binding of the memoized function.
   *
   * **Note:** The cache is exposed as the `cache` property on the memoized
   * function. Its creation may be customized by replacing the `_.memoize.Cache`
   * constructor with one whose instances implement the
   * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
   * method interface of `clear`, `delete`, `get`, `has`, and `set`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to have its output memoized.
   * @param {Function} [resolver] The function to resolve the cache key.
   * @returns {Function} Returns the new memoized function.
   * @example
   *
   * var object = { 'a': 1, 'b': 2 };
   * var other = { 'c': 3, 'd': 4 };
   *
   * var values = _.memoize(_.values);
   * values(object);
   * // => [1, 2]
   *
   * values(other);
   * // => [3, 4]
   *
   * object.a = 2;
   * values(object);
   * // => [1, 2]
   *
   * // Modify the result cache.
   * values.cache.set(object, ['a', 'b']);
   * values(object);
   * // => ['a', 'b']
   *
   * // Replace `_.memoize.Cache`.
   * _.memoize.Cache = WeakMap;
   */
  function memoize$1(func, resolver) {
    if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize$1.Cache || MapCache);
    return memoized;
  }

  // Expose `MapCache`.
  memoize$1.Cache = MapCache;

  var memoize_1 = memoize$1;

  var memoize = memoize_1;

  /** Used as the maximum memoize cache size. */
  var MAX_MEMOIZE_SIZE = 500;

  /**
   * A specialized version of `_.memoize` which clears the memoized function's
   * cache when it exceeds `MAX_MEMOIZE_SIZE`.
   *
   * @private
   * @param {Function} func The function to have its output memoized.
   * @returns {Function} Returns the new memoized function.
   */
  function memoizeCapped$1(func) {
    var result = memoize(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });

    var cache = result.cache;
    return result;
  }

  var _memoizeCapped = memoizeCapped$1;

  var memoizeCapped = _memoizeCapped;

  /** Used to match property names within property paths. */
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /**
   * Converts `string` to a property path array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the property path array.
   */
  var stringToPath$2 = memoizeCapped(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46 /* . */) {
      result.push('');
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  });

  var _stringToPath = stringToPath$2;

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */

  function arrayMap$3(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  var _arrayMap = arrayMap$3;

  var Symbol$2 = _Symbol,
      arrayMap$2 = _arrayMap,
      isArray$6 = isArray_1,
      isSymbol$2 = isSymbol_1;

  /** Used as references for various `Number` constants. */
  var INFINITY$1 = 1 / 0;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol$2 ? Symbol$2.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString$1(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isArray$6(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap$2(value, baseToString$1) + '';
    }
    if (isSymbol$2(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
  }

  var _baseToString = baseToString$1;

  var baseToString = _baseToString;

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString$6(value) {
    return value == null ? '' : baseToString(value);
  }

  var toString_1 = toString$6;

  var isArray$5 = isArray_1,
      isKey$2 = _isKey,
      stringToPath$1 = _stringToPath,
      toString$5 = toString_1;

  /**
   * Casts `value` to a path array if it's not one.
   *
   * @private
   * @param {*} value The value to inspect.
   * @param {Object} [object] The object to query keys on.
   * @returns {Array} Returns the cast property path array.
   */
  function castPath$2(value, object) {
    if (isArray$5(value)) {
      return value;
    }
    return isKey$2(value, object) ? [value] : stringToPath$1(toString$5(value));
  }

  var _castPath = castPath$2;

  var isSymbol$1 = isSymbol_1;

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0;

  /**
   * Converts `value` to a string key if it's not a string or symbol.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {string|symbol} Returns the key.
   */
  function toKey$5(value) {
    if (typeof value == 'string' || isSymbol$1(value)) {
      return value;
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  var _toKey = toKey$5;

  var castPath$1 = _castPath,
      toKey$4 = _toKey;

  /**
   * The base implementation of `_.get` without support for default values.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @returns {*} Returns the resolved value.
   */
  function baseGet$2(object, path) {
    path = castPath$1(path, object);

    var index = 0,
        length = path.length;

    while (object != null && index < length) {
      object = object[toKey$4(path[index++])];
    }
    return (index && index == length) ? object : undefined;
  }

  var _baseGet = baseGet$2;

  var baseGet$1 = _baseGet;

  /**
   * Gets the value at `path` of `object`. If the resolved value is
   * `undefined`, the `defaultValue` is returned in its place.
   *
   * @static
   * @memberOf _
   * @since 3.7.0
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @param {*} [defaultValue] The value returned for `undefined` resolved values.
   * @returns {*} Returns the resolved value.
   * @example
   *
   * var object = { 'a': [{ 'b': { 'c': 3 } }] };
   *
   * _.get(object, 'a[0].b.c');
   * // => 3
   *
   * _.get(object, ['a', '0', 'b', 'c']);
   * // => 3
   *
   * _.get(object, 'a.b.c', 'default');
   * // => 'default'
   */
  function get$1(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet$1(object, path);
    return result === undefined ? defaultValue : result;
  }

  var get_1 = get$1;

  /**
   * The base implementation of `_.hasIn` without support for deep paths.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {Array|string} key The key to check.
   * @returns {boolean} Returns `true` if `key` exists, else `false`.
   */

  function baseHasIn$1(object, key) {
    return object != null && key in Object(object);
  }

  var _baseHasIn = baseHasIn$1;

  var castPath = _castPath,
      isArguments$1 = isArguments_1,
      isArray$4 = isArray_1,
      isIndex = _isIndex,
      isLength = isLength_1,
      toKey$3 = _toKey;

  /**
   * Checks if `path` exists on `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @param {Function} hasFunc The function to check properties.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   */
  function hasPath$1(object, path, hasFunc) {
    path = castPath(path, object);

    var index = -1,
        length = path.length,
        result = false;

    while (++index < length) {
      var key = toKey$3(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return !!length && isLength(length) && isIndex(key, length) &&
      (isArray$4(object) || isArguments$1(object));
  }

  var _hasPath = hasPath$1;

  var baseHasIn = _baseHasIn,
      hasPath = _hasPath;

  /**
   * Checks if `path` is a direct or inherited property of `object`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   * @example
   *
   * var object = _.create({ 'a': _.create({ 'b': 2 }) });
   *
   * _.hasIn(object, 'a');
   * // => true
   *
   * _.hasIn(object, 'a.b');
   * // => true
   *
   * _.hasIn(object, ['a', 'b']);
   * // => true
   *
   * _.hasIn(object, 'b');
   * // => false
   */
  function hasIn$1(object, path) {
    return object != null && hasPath(object, path, baseHasIn);
  }

  var hasIn_1 = hasIn$1;

  var baseIsEqual = _baseIsEqual,
      get = get_1,
      hasIn = hasIn_1,
      isKey$1 = _isKey,
      isStrictComparable = _isStrictComparable,
      matchesStrictComparable = _matchesStrictComparable,
      toKey$2 = _toKey;

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG = 1,
      COMPARE_UNORDERED_FLAG = 2;

  /**
   * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
   *
   * @private
   * @param {string} path The path of the property to get.
   * @param {*} srcValue The value to match.
   * @returns {Function} Returns the new spec function.
   */
  function baseMatchesProperty$1(path, srcValue) {
    if (isKey$1(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey$2(path), srcValue);
    }
    return function(object) {
      var objValue = get(object, path);
      return (objValue === undefined && objValue === srcValue)
        ? hasIn(object, path)
        : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
    };
  }

  var _baseMatchesProperty = baseMatchesProperty$1;

  /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new accessor function.
   */

  function baseProperty$1(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  var _baseProperty = baseProperty$1;

  var baseGet = _baseGet;

  /**
   * A specialized version of `baseProperty` which supports deep paths.
   *
   * @private
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyDeep$1(path) {
    return function(object) {
      return baseGet(object, path);
    };
  }

  var _basePropertyDeep = basePropertyDeep$1;

  var baseProperty = _baseProperty,
      basePropertyDeep = _basePropertyDeep,
      isKey = _isKey,
      toKey$1 = _toKey;

  /**
   * Creates a function that returns the value at `path` of a given object.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new accessor function.
   * @example
   *
   * var objects = [
   *   { 'a': { 'b': 2 } },
   *   { 'a': { 'b': 1 } }
   * ];
   *
   * _.map(objects, _.property('a.b'));
   * // => [2, 1]
   *
   * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
   * // => [1, 2]
   */
  function property$1(path) {
    return isKey(path) ? baseProperty(toKey$1(path)) : basePropertyDeep(path);
  }

  var property_1 = property$1;

  var baseMatches = _baseMatches,
      baseMatchesProperty = _baseMatchesProperty,
      identity = identity_1,
      isArray$3 = isArray_1,
      property = property_1;

  /**
   * The base implementation of `_.iteratee`.
   *
   * @private
   * @param {*} [value=_.identity] The value to convert to an iteratee.
   * @returns {Function} Returns the iteratee.
   */
  function baseIteratee$2(value) {
    // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
    // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
    if (typeof value == 'function') {
      return value;
    }
    if (value == null) {
      return identity;
    }
    if (typeof value == 'object') {
      return isArray$3(value)
        ? baseMatchesProperty(value[0], value[1])
        : baseMatches(value);
    }
    return property(value);
  }

  var _baseIteratee = baseIteratee$2;

  var baseClone = _baseClone,
      baseIteratee$1 = _baseIteratee;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1;

  /**
   * Creates a function that invokes `func` with the arguments of the created
   * function. If `func` is a property name, the created function returns the
   * property value for a given element. If `func` is an array or object, the
   * created function returns `true` for elements that contain the equivalent
   * source properties, otherwise it returns `false`.
   *
   * @static
   * @since 4.0.0
   * @memberOf _
   * @category Util
   * @param {*} [func=_.identity] The value to convert to a callback.
   * @returns {Function} Returns the callback.
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': true },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * // The `_.matches` iteratee shorthand.
   * _.filter(users, _.iteratee({ 'user': 'barney', 'active': true }));
   * // => [{ 'user': 'barney', 'age': 36, 'active': true }]
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.filter(users, _.iteratee(['user', 'fred']));
   * // => [{ 'user': 'fred', 'age': 40 }]
   *
   * // The `_.property` iteratee shorthand.
   * _.map(users, _.iteratee('user'));
   * // => ['barney', 'fred']
   *
   * // Create custom iteratee shorthands.
   * _.iteratee = _.wrap(_.iteratee, function(iteratee, func) {
   *   return !_.isRegExp(func) ? iteratee(func) : function(string) {
   *     return func.test(string);
   *   };
   * });
   *
   * _.filter(['abc', 'def'], /ef/);
   * // => ['def']
   */
  function iteratee(func) {
    return baseIteratee$1(typeof func == 'function' ? func : baseClone(func, CLONE_DEEP_FLAG));
  }

  var iteratee_1 = iteratee;

  var Symbol$1 = _Symbol,
      isArguments = isArguments_1,
      isArray$2 = isArray_1;

  /** Built-in value references. */
  var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;

  /**
   * Checks if `value` is a flattenable `arguments` object or array.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
   */
  function isFlattenable$1(value) {
    return isArray$2(value) || isArguments(value) ||
      !!(spreadableSymbol && value && value[spreadableSymbol]);
  }

  var _isFlattenable = isFlattenable$1;

  var arrayPush = _arrayPush,
      isFlattenable = _isFlattenable;

  /**
   * The base implementation of `_.flatten` with support for restricting flattening.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {number} depth The maximum recursion depth.
   * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
   * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */
  function baseFlatten$2(array, depth, predicate, isStrict, result) {
    var index = -1,
        length = array.length;

    predicate || (predicate = isFlattenable);
    result || (result = []);

    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten$2(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }

  var _baseFlatten = baseFlatten$2;

  var baseFlatten$1 = _baseFlatten;

  /**
   * Flattens `array` a single level deep.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to flatten.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flatten([1, [2, [3, [4]], 5]]);
   * // => [1, 2, [3, [4]], 5]
   */
  function flatten$1(array) {
    var length = array == null ? 0 : array.length;
    return length ? baseFlatten$1(array, 1) : [];
  }

  var flatten_1 = flatten$1;

  var apply = _apply;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max;

  /**
   * A specialized version of `baseRest` which transforms the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @param {Function} transform The rest array transform.
   * @returns {Function} Returns the new function.
   */
  function overRest$1(func, start, transform) {
    start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }

  var _overRest = overRest$1;

  var flatten = flatten_1,
      overRest = _overRest,
      setToString = _setToString;

  /**
   * A specialized version of `baseRest` which flattens the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @returns {Function} Returns the new function.
   */
  function flatRest$1(func) {
    return setToString(overRest(func, undefined, flatten), func + '');
  }

  var _flatRest = flatRest$1;

  var createWrap = _createWrap,
      flatRest = _flatRest;

  /** Used to compose bitmasks for function metadata. */
  var WRAP_REARG_FLAG = 256;

  /**
   * Creates a function that invokes `func` with arguments arranged according
   * to the specified `indexes` where the argument value at the first index is
   * provided as the first argument, the argument value at the second index is
   * provided as the second argument, and so on.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Function
   * @param {Function} func The function to rearrange arguments for.
   * @param {...(number|number[])} indexes The arranged argument indexes.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var rearged = _.rearg(function(a, b, c) {
   *   return [a, b, c];
   * }, [2, 0, 1]);
   *
   * rearged('b', 'c', 'a')
   * // => ['a', 'b', 'c']
   */
  var rearg = flatRest(function(func, indexes) {
    return createWrap(func, WRAP_REARG_FLAG, undefined, undefined, undefined, indexes);
  });

  var rearg_1 = rearg;

  var arrayMap$1 = _arrayMap,
      copyArray = _copyArray,
      isArray$1 = isArray_1,
      isSymbol = isSymbol_1,
      stringToPath = _stringToPath,
      toKey = _toKey,
      toString$4 = toString_1;

  /**
   * Converts `value` to a property path array.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Util
   * @param {*} value The value to convert.
   * @returns {Array} Returns the new property path array.
   * @example
   *
   * _.toPath('a.b.c');
   * // => ['a', 'b', 'c']
   *
   * _.toPath('a[0].b.c');
   * // => ['a', '0', 'b', 'c']
   */
  function toPath(value) {
    if (isArray$1(value)) {
      return arrayMap$1(value, toKey);
    }
    return isSymbol(value) ? [value] : copyArray(stringToPath(toString$4(value)));
  }

  var toPath_1 = toPath;

  var _util = {
    'ary': ary_1,
    'assign': _baseAssign,
    'clone': clone_1$2,
    'curry': curry_1,
    'forEach': _arrayEach,
    'isArray': isArray_1,
    'isError': isError_1,
    'isFunction': isFunction_1,
    'isWeakMap': isWeakMap_1,
    'iteratee': iteratee_1,
    'keys': _baseKeys,
    'rearg': rearg_1,
    'toInteger': toInteger_1,
    'toPath': toPath_1
  };

  var baseConvert = _baseConvert,
      util = _util;

  /**
   * Converts `func` of `name` to an immutable auto-curried iteratee-first data-last
   * version with conversion `options` applied. If `name` is an object its methods
   * will be converted.
   *
   * @param {string} name The name of the function to wrap.
   * @param {Function} [func] The function to wrap.
   * @param {Object} [options] The options object. See `baseConvert` for more details.
   * @returns {Function|Object} Returns the converted function or object.
   */
  function convert$1(name, func, options) {
    return baseConvert(util, name, func, options);
  }

  var convert_1 = convert$1;

  /**
   * The base implementation of `_.slice` without an iteratee call guard.
   *
   * @private
   * @param {Array} array The array to slice.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the slice of `array`.
   */

  function baseSlice$1(array, start, end) {
    var index = -1,
        length = array.length;

    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;

    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }

  var _baseSlice = baseSlice$1;

  var baseSlice = _baseSlice;

  /**
   * Casts `array` to a slice if it's needed.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {number} start The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the cast slice.
   */
  function castSlice$1(array, start, end) {
    var length = array.length;
    end = end === undefined ? length : end;
    return (!start && end >= length) ? array : baseSlice(array, start, end);
  }

  var _castSlice = castSlice$1;

  /** Used to compose unicode character classes. */

  var rsAstralRange$2 = '\\ud800-\\udfff',
      rsComboMarksRange$3 = '\\u0300-\\u036f',
      reComboHalfMarksRange$3 = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange$3 = '\\u20d0-\\u20ff',
      rsComboRange$3 = rsComboMarksRange$3 + reComboHalfMarksRange$3 + rsComboSymbolsRange$3,
      rsVarRange$2 = '\\ufe0e\\ufe0f';

  /** Used to compose unicode capture groups. */
  var rsZWJ$2 = '\\u200d';

  /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
  var reHasUnicode = RegExp('[' + rsZWJ$2 + rsAstralRange$2  + rsComboRange$3 + rsVarRange$2 + ']');

  /**
   * Checks if `string` contains Unicode symbols.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {boolean} Returns `true` if a symbol is found, else `false`.
   */
  function hasUnicode$2(string) {
    return reHasUnicode.test(string);
  }

  var _hasUnicode = hasUnicode$2;

  /**
   * Converts an ASCII `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */

  function asciiToArray$1(string) {
    return string.split('');
  }

  var _asciiToArray = asciiToArray$1;

  /** Used to compose unicode character classes. */

  var rsAstralRange$1 = '\\ud800-\\udfff',
      rsComboMarksRange$2 = '\\u0300-\\u036f',
      reComboHalfMarksRange$2 = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange$2 = '\\u20d0-\\u20ff',
      rsComboRange$2 = rsComboMarksRange$2 + reComboHalfMarksRange$2 + rsComboSymbolsRange$2,
      rsVarRange$1 = '\\ufe0e\\ufe0f';

  /** Used to compose unicode capture groups. */
  var rsAstral = '[' + rsAstralRange$1 + ']',
      rsCombo$2 = '[' + rsComboRange$2 + ']',
      rsFitz$1 = '\\ud83c[\\udffb-\\udfff]',
      rsModifier$1 = '(?:' + rsCombo$2 + '|' + rsFitz$1 + ')',
      rsNonAstral$1 = '[^' + rsAstralRange$1 + ']',
      rsRegional$1 = '(?:\\ud83c[\\udde6-\\uddff]){2}',
      rsSurrPair$1 = '[\\ud800-\\udbff][\\udc00-\\udfff]',
      rsZWJ$1 = '\\u200d';

  /** Used to compose unicode regexes. */
  var reOptMod$1 = rsModifier$1 + '?',
      rsOptVar$1 = '[' + rsVarRange$1 + ']?',
      rsOptJoin$1 = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral$1, rsRegional$1, rsSurrPair$1].join('|') + ')' + rsOptVar$1 + reOptMod$1 + ')*',
      rsSeq$1 = rsOptVar$1 + reOptMod$1 + rsOptJoin$1,
      rsSymbol = '(?:' + [rsNonAstral$1 + rsCombo$2 + '?', rsCombo$2, rsRegional$1, rsSurrPair$1, rsAstral].join('|') + ')';

  /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
  var reUnicode = RegExp(rsFitz$1 + '(?=' + rsFitz$1 + ')|' + rsSymbol + rsSeq$1, 'g');

  /**
   * Converts a Unicode `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */
  function unicodeToArray$1(string) {
    return string.match(reUnicode) || [];
  }

  var _unicodeToArray = unicodeToArray$1;

  var asciiToArray = _asciiToArray,
      hasUnicode$1 = _hasUnicode,
      unicodeToArray = _unicodeToArray;

  /**
   * Converts `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */
  function stringToArray$1(string) {
    return hasUnicode$1(string)
      ? unicodeToArray(string)
      : asciiToArray(string);
  }

  var _stringToArray = stringToArray$1;

  var castSlice = _castSlice,
      hasUnicode = _hasUnicode,
      stringToArray = _stringToArray,
      toString$3 = toString_1;

  /**
   * Creates a function like `_.lowerFirst`.
   *
   * @private
   * @param {string} methodName The name of the `String` case method to use.
   * @returns {Function} Returns the new case function.
   */
  function createCaseFirst$1(methodName) {
    return function(string) {
      string = toString$3(string);

      var strSymbols = hasUnicode(string)
        ? stringToArray(string)
        : undefined;

      var chr = strSymbols
        ? strSymbols[0]
        : string.charAt(0);

      var trailing = strSymbols
        ? castSlice(strSymbols, 1).join('')
        : string.slice(1);

      return chr[methodName]() + trailing;
    };
  }

  var _createCaseFirst = createCaseFirst$1;

  var createCaseFirst = _createCaseFirst;

  /**
   * Converts the first character of `string` to upper case.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category String
   * @param {string} [string=''] The string to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.upperFirst('fred');
   * // => 'Fred'
   *
   * _.upperFirst('FRED');
   * // => 'FRED'
   */
  var upperFirst$1 = createCaseFirst('toUpperCase');

  var upperFirst_1 = upperFirst$1;

  var toString$2 = toString_1,
      upperFirst = upperFirst_1;

  /**
   * Converts the first character of `string` to upper case and the remaining
   * to lower case.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to capitalize.
   * @returns {string} Returns the capitalized string.
   * @example
   *
   * _.capitalize('FRED');
   * // => 'Fred'
   */
  function capitalize(string) {
    return upperFirst(toString$2(string).toLowerCase());
  }

  var capitalize_1 = capitalize;

  var capitalize$1 = /*@__PURE__*/getDefaultExportFromCjs(capitalize_1);

  /**
   * A specialized version of `_.reduce` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initAccum] Specify using the first element of `array` as
   *  the initial value.
   * @returns {*} Returns the accumulated value.
   */

  function arrayReduce$1(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array == null ? 0 : array.length;

    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  var _arrayReduce = arrayReduce$1;

  /**
   * The base implementation of `_.propertyOf` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Function} Returns the new accessor function.
   */

  function basePropertyOf$1(object) {
    return function(key) {
      return object == null ? undefined : object[key];
    };
  }

  var _basePropertyOf = basePropertyOf$1;

  var basePropertyOf = _basePropertyOf;

  /** Used to map Latin Unicode letters to basic Latin letters. */
  var deburredLetters = {
    // Latin-1 Supplement block.
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss',
    // Latin Extended-A block.
    '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
    '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
    '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
    '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
    '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
    '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
    '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
    '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
    '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
    '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
    '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
    '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
    '\u0134': 'J',  '\u0135': 'j',
    '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
    '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
    '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
    '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
    '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
    '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
    '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
    '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
    '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
    '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
    '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
    '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
    '\u0163': 't',  '\u0165': 't', '\u0167': 't',
    '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
    '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
    '\u0174': 'W',  '\u0175': 'w',
    '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
    '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
    '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
    '\u0132': 'IJ', '\u0133': 'ij',
    '\u0152': 'Oe', '\u0153': 'oe',
    '\u0149': "'n", '\u017f': 's'
  };

  /**
   * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
   * letters to basic Latin letters.
   *
   * @private
   * @param {string} letter The matched letter to deburr.
   * @returns {string} Returns the deburred letter.
   */
  var deburrLetter$1 = basePropertyOf(deburredLetters);

  var _deburrLetter = deburrLetter$1;

  var deburrLetter = _deburrLetter,
      toString$1 = toString_1;

  /** Used to match Latin Unicode letters (excluding mathematical operators). */
  var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

  /** Used to compose unicode character classes. */
  var rsComboMarksRange$1 = '\\u0300-\\u036f',
      reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange$1 = '\\u20d0-\\u20ff',
      rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;

  /** Used to compose unicode capture groups. */
  var rsCombo$1 = '[' + rsComboRange$1 + ']';

  /**
   * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
   * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
   */
  var reComboMark = RegExp(rsCombo$1, 'g');

  /**
   * Deburrs `string` by converting
   * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
   * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
   * letters to basic Latin letters and removing
   * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to deburr.
   * @returns {string} Returns the deburred string.
   * @example
   *
   * _.deburr('dÃ©jÃ  vu');
   * // => 'deja vu'
   */
  function deburr$1(string) {
    string = toString$1(string);
    return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
  }

  var deburr_1 = deburr$1;

  /** Used to match words composed of alphanumeric characters. */

  var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

  /**
   * Splits an ASCII `string` into an array of its words.
   *
   * @private
   * @param {string} The string to inspect.
   * @returns {Array} Returns the words of `string`.
   */
  function asciiWords$1(string) {
    return string.match(reAsciiWord) || [];
  }

  var _asciiWords = asciiWords$1;

  /** Used to detect strings that need a more robust regexp to match words. */

  var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

  /**
   * Checks if `string` contains a word composed of Unicode symbols.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {boolean} Returns `true` if a word is found, else `false`.
   */
  function hasUnicodeWord$1(string) {
    return reHasUnicodeWord.test(string);
  }

  var _hasUnicodeWord = hasUnicodeWord$1;

  /** Used to compose unicode character classes. */

  var rsAstralRange = '\\ud800-\\udfff',
      rsComboMarksRange = '\\u0300-\\u036f',
      reComboHalfMarksRange = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange = '\\u20d0-\\u20ff',
      rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
      rsDingbatRange = '\\u2700-\\u27bf',
      rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
      rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
      rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
      rsPunctuationRange = '\\u2000-\\u206f',
      rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
      rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
      rsVarRange = '\\ufe0e\\ufe0f',
      rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

  /** Used to compose unicode capture groups. */
  var rsApos$1 = "['\u2019]",
      rsBreak = '[' + rsBreakRange + ']',
      rsCombo = '[' + rsComboRange + ']',
      rsDigits = '\\d+',
      rsDingbat = '[' + rsDingbatRange + ']',
      rsLower = '[' + rsLowerRange + ']',
      rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
      rsFitz = '\\ud83c[\\udffb-\\udfff]',
      rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
      rsNonAstral = '[^' + rsAstralRange + ']',
      rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
      rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
      rsUpper = '[' + rsUpperRange + ']',
      rsZWJ = '\\u200d';

  /** Used to compose unicode regexes. */
  var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
      rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
      rsOptContrLower = '(?:' + rsApos$1 + '(?:d|ll|m|re|s|t|ve))?',
      rsOptContrUpper = '(?:' + rsApos$1 + '(?:D|LL|M|RE|S|T|VE))?',
      reOptMod = rsModifier + '?',
      rsOptVar = '[' + rsVarRange + ']?',
      rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
      rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
      rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
      rsSeq = rsOptVar + reOptMod + rsOptJoin,
      rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq;

  /** Used to match complex or compound words. */
  var reUnicodeWord = RegExp([
    rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
    rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')',
    rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower,
    rsUpper + '+' + rsOptContrUpper,
    rsOrdUpper,
    rsOrdLower,
    rsDigits,
    rsEmoji
  ].join('|'), 'g');

  /**
   * Splits a Unicode `string` into an array of its words.
   *
   * @private
   * @param {string} The string to inspect.
   * @returns {Array} Returns the words of `string`.
   */
  function unicodeWords$1(string) {
    return string.match(reUnicodeWord) || [];
  }

  var _unicodeWords = unicodeWords$1;

  var asciiWords = _asciiWords,
      hasUnicodeWord = _hasUnicodeWord,
      toString = toString_1,
      unicodeWords = _unicodeWords;

  /**
   * Splits `string` into an array of its words.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to inspect.
   * @param {RegExp|string} [pattern] The pattern to match words.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Array} Returns the words of `string`.
   * @example
   *
   * _.words('fred, barney, & pebbles');
   * // => ['fred', 'barney', 'pebbles']
   *
   * _.words('fred, barney, & pebbles', /[^, ]+/g);
   * // => ['fred', 'barney', '&', 'pebbles']
   */
  function words$1(string, pattern, guard) {
    string = toString(string);
    pattern = guard ? undefined : pattern;

    if (pattern === undefined) {
      return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
    }
    return string.match(pattern) || [];
  }

  var words_1 = words$1;

  var arrayReduce = _arrayReduce,
      deburr = deburr_1,
      words = words_1;

  /** Used to compose unicode capture groups. */
  var rsApos = "['\u2019]";

  /** Used to match apostrophes. */
  var reApos = RegExp(rsApos, 'g');

  /**
   * Creates a function like `_.camelCase`.
   *
   * @private
   * @param {Function} callback The function to combine each word.
   * @returns {Function} Returns the new compounder function.
   */
  function createCompounder$1(callback) {
    return function(string) {
      return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
    };
  }

  var _createCompounder = createCompounder$1;

  var _falseOptions;
  var hasRequired_falseOptions;

  function require_falseOptions () {
  	if (hasRequired_falseOptions) return _falseOptions;
  	hasRequired_falseOptions = 1;
  	_falseOptions = {
  	  'cap': false,
  	  'curry': false,
  	  'fixed': false,
  	  'immutable': false,
  	  'rearg': false
  	};
  	return _falseOptions;
  }

  var kebabCase_1;
  var hasRequiredKebabCase;

  function requireKebabCase () {
  	if (hasRequiredKebabCase) return kebabCase_1;
  	hasRequiredKebabCase = 1;
  	var createCompounder = _createCompounder;

  	/**
  	 * Converts `string` to
  	 * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
  	 *
  	 * @static
  	 * @memberOf _
  	 * @since 3.0.0
  	 * @category String
  	 * @param {string} [string=''] The string to convert.
  	 * @returns {string} Returns the kebab cased string.
  	 * @example
  	 *
  	 * _.kebabCase('Foo Bar');
  	 * // => 'foo-bar'
  	 *
  	 * _.kebabCase('fooBar');
  	 * // => 'foo-bar'
  	 *
  	 * _.kebabCase('__FOO_BAR__');
  	 * // => 'foo-bar'
  	 */
  	var kebabCase = createCompounder(function(result, word, index) {
  	  return result + (index ? '-' : '') + word.toLowerCase();
  	});

  	kebabCase_1 = kebabCase;
  	return kebabCase_1;
  }

  var convert = convert_1,
      func = convert('kebabCase', requireKebabCase(), require_falseOptions());

  func.placeholder = requirePlaceholder();
  var kebabCase$1 = func;

  var _kebabCase = /*@__PURE__*/getDefaultExportFromCjs(kebabCase$1);

  var createCompounder = _createCompounder;

  /**
   * Converts `string` to
   * [snake case](https://en.wikipedia.org/wiki/Snake_case).
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to convert.
   * @returns {string} Returns the snake cased string.
   * @example
   *
   * _.snakeCase('Foo Bar');
   * // => 'foo_bar'
   *
   * _.snakeCase('fooBar');
   * // => 'foo_bar'
   *
   * _.snakeCase('--FOO-BAR--');
   * // => 'foo_bar'
   */
  var snakeCase = createCompounder(function(result, word, index) {
    return result + (index ? '_' : '') + word.toLowerCase();
  });

  var snakeCase_1 = snakeCase;

  var snakeCase$1 = /*@__PURE__*/getDefaultExportFromCjs(snakeCase_1);

  const kebabCase = (str) => _kebabCase(str);

  const KONSTRUCT_ELEMENT_TAG_PREFIX = 'k';
  const formatKonstructElementTag = (tag) => {
      const casedTag = kebabCase(tag).toLowerCase();
      if (!casedTag.startsWith(KONSTRUCT_ELEMENT_TAG_PREFIX)) {
          return casedTag.startsWith('-')
              ? `${KONSTRUCT_ELEMENT_TAG_PREFIX}${casedTag}`
              : `${KONSTRUCT_ELEMENT_TAG_PREFIX}-${casedTag}`;
      }
      return `${KONSTRUCT_ELEMENT_TAG_PREFIX}-${casedTag}`;
  };
  const customElement = (tagName) => {
      if (customElements.get(tagName)) {
          return () => { };
      }
      return e$4(formatKonstructElementTag(tagName));
  };

  /**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const l$2=l=>null!=l?l:A;

  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const l$1=e$6(class extends i$4{constructor(r){if(super(r),r.type!==t$1.PROPERTY&&r.type!==t$1.ATTRIBUTE&&r.type!==t$1.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!e$5(r))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(i,[t]){if(t===T||t===A)return t;const o=i.element,l=i.name;if(i.type===t$1.PROPERTY){if(t===o[l])return T}else if(i.type===t$1.BOOLEAN_ATTRIBUTE){if(!!t===o.hasAttribute(l))return T}else if(i.type===t$1.ATTRIBUTE&&o.getAttribute(l)===t+"")return T;return a$1(i),t}});

  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const e$1=()=>new o$3;let o$3 = class o{};const h=new WeakMap,n$3=e$6(class extends c{render(t){return A}update(t,[s]){var e;const o=s!==this.G;return o&&void 0!==this.G&&this.ot(void 0),(o||this.rt!==this.lt)&&(this.G=s,this.dt=null===(e=t.options)||void 0===e?void 0:e.host,this.ot(this.lt=t.element)),A}ot(i){var t;if("function"==typeof this.G){const s=null!==(t=this.dt)&&void 0!==t?t:globalThis;let e=h.get(s);void 0===e&&(e=new WeakMap,h.set(s,e)),void 0!==e.get(this.G)&&this.G.call(this.dt,void 0),e.set(this.G,i),void 0!==i&&this.G.call(this.dt,i);}else this.G.value=i;}get rt(){var i,t,s;return "function"==typeof this.G?null===(t=h.get(null!==(i=this.dt)&&void 0!==i?i:globalThis))||void 0===t?void 0:t.get(this.G):null===(s=this.G)||void 0===s?void 0:s.value}disconnected(){this.rt===this.lt&&this.ot(void 0);}reconnected(){this.ot(this.lt);}});

  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  function n$2(n,o,r){return n?o():null==r?void 0:r()}

  /**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const o$2=e$6(class extends i$4{constructor(t){var i;if(super(t),t.type!==t$1.ATTRIBUTE||"class"!==t.name||(null===(i=t.strings)||void 0===i?void 0:i.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return " "+Object.keys(t).filter((i=>t[i])).join(" ")+" "}update(i,[s]){var r,o;if(void 0===this.it){this.it=new Set,void 0!==i.strings&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in s)s[t]&&!(null===(r=this.nt)||void 0===r?void 0:r.has(t))&&this.it.add(t);return this.render(s)}const e=i.element.classList;this.it.forEach((t=>{t in s||(e.remove(t),this.it.delete(t));}));for(const t in s){const i=!!s[t];i===this.it.has(t)||(null===(o=this.nt)||void 0===o?void 0:o.has(t))||(i?(e.add(t),this.it.add(t)):(e.remove(t),this.it.delete(t)));}return T}});

  const classMap = (...params) => {
      const map = params.reduce((acc, param) => {
          if (!param) {
              return acc;
          }
          if (typeof param === 'string') {
              return {
                  ...acc,
                  [param]: true,
              };
          }
          return {
              ...acc,
              ...Object.keys(param).reduce((a, k) => ({ ...a, [k]: Boolean(param[k]) }), {}),
          };
      }, {});
      return o$2(map);
  };

  /**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const i$1="important",n$1=" !"+i$1,o$1=e$6(class extends i$4{constructor(t){var e;if(super(t),t.type!==t$1.ATTRIBUTE||"style"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce(((e,r)=>{const s=t[r];return null==s?e:e+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`}),"")}update(e,[r]){const{style:s}=e.element;if(void 0===this.ht){this.ht=new Set;for(const t in r)this.ht.add(t);return this.render(r)}this.ht.forEach((t=>{null==r[t]&&(this.ht.delete(t),t.includes("-")?s.removeProperty(t):s[t]="");}));for(const t in r){const e=r[t];if(null!=e){this.ht.add(t);const r="string"==typeof e&&e.endsWith(n$1);t.includes("-")||r?s.setProperty(t,r?e.slice(0,-11):e,r?i$1:""):s[t]=e;}}return T}});

  const styleMap = (styleInfo) => {
      const map = Object.entries(styleInfo).reduce((acc, [key, val]) => {
          if (typeof val !== 'number' && typeof val !== 'string') {
              return acc;
          }
          if (typeof val === 'number' && val !== 0) {
              /**
               * Allows for passing pixel values in numbers without the 'px' suffix.
               */
              return {
                  ...acc,
                  [key]: `${val}px`,
              };
          }
          return {
              ...acc,
              [key]: val,
          };
      }, {});
      return o$1(map);
  };

  const NumberEnum = Symbol('StringEnum');
  const StringEnum = Symbol('StringEnum');
  const enumProperty = ({ options, ...declaration }) => {
      return n$5({
          ...declaration,
          converter: (val) => {
              if (!val || !options.map(String).includes(val)) {
                  return null;
              }
              return val;
          },
          options,
          reflect: true,
          type: typeof options[0] === 'number' ? NumberEnum : StringEnum,
      });
  };

  // Unique ID creation requires a high quality random # generator. In the browser we therefore
  // require the crypto API and do not support built-in fallback to lower quality random number
  // generators (like Math.random()).
  let getRandomValues;
  const rnds8 = new Uint8Array(16);
  function rng() {
    // lazy load so that environments that need to polyfill have a chance to do so
    if (!getRandomValues) {
      // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
      getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

      if (!getRandomValues) {
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
      }
    }

    return getRandomValues(rnds8);
  }

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */

  const byteToHex = [];

  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
  }

  function unsafeStringify(arr, offset = 0) {
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native = {
    randomUUID
  };

  function v4(options, buf, offset) {
    if (native.randomUUID && !buf && !options) {
      return native.randomUUID();
    }

    options = options || {};
    const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }

      return buf;
    }

    return unsafeStringify(rnds);
  }

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z$1l = i$6`:root{--k-blur-xs:1.5px;--k-blur-sm:4px;--k-blur-md:8px;--k-blur-lg:12px;--k-blur-xl:20px;--k-blur-xxl:40px;--k-blur-xxxl:60px;--k-breakpoint-sm:40rem;--k-breakpoint-md:45rem;--k-breakpoint-lg:64rem;--k-breakpoint-xl:80rem;--k-breakpoint-xxl:90rem;--k-color-sheer-black-10:rgba(0 0 0/1%);--k-color-sheer-black-50:rgba(0 0 0/5%);--k-color-sheer-black-100:rgba(0,0,0,.1);--k-color-sheer-black-200:rgba(0,0,0,.2);--k-color-sheer-black-300:rgba(0,0,0,.3);--k-color-sheer-black-400:rgba(0,0,0,.4);--k-color-sheer-black-500:rgba(0,0,0,.5);--k-color-sheer-black-600:rgba(0,0,0,.6);--k-color-sheer-black-700:rgba(0,0,0,.7);--k-color-sheer-black-800:rgba(0,0,0,.8);--k-color-sheer-black-900:rgba(0,0,0,.9);--k-color-sheer-black-950:rgba(0 0 0/95%);--k-color-sheer-cool-black-10:rgba(13 18 28/1%);--k-color-sheer-cool-black-50:rgba(13 18 28/5%);--k-color-sheer-cool-black-100:rgba(13,18,28,.1);--k-color-sheer-cool-black-200:rgba(13,18,28,.2);--k-color-sheer-cool-black-300:rgba(13,18,28,.3);--k-color-sheer-cool-black-400:rgba(13,18,28,.4);--k-color-sheer-cool-black-500:rgba(13,18,28,.5);--k-color-sheer-cool-black-600:rgba(13,18,28,.6);--k-color-sheer-cool-black-700:rgba(13,18,28,.7);--k-color-sheer-cool-black-800:rgba(13,18,28,.8);--k-color-sheer-cool-black-900:rgba(13,18,28,.9);--k-color-sheer-cool-black-950:rgba(13 18 28/95%);--k-color-sheer-white-10:hsla(0,0%,100%,.01);--k-color-sheer-white-50:hsla(0,0%,100%,.05);--k-color-sheer-white-100:hsla(0,0%,100%,.1);--k-color-sheer-white-200:hsla(0,0%,100%,.2);--k-color-sheer-white-300:hsla(0,0%,100%,.3);--k-color-sheer-white-400:hsla(0,0%,100%,.4);--k-color-sheer-white-500:hsla(0,0%,100%,.5);--k-color-sheer-white-600:hsla(0,0%,100%,.6);--k-color-sheer-white-700:hsla(0,0%,100%,.7);--k-color-sheer-white-800:hsla(0,0%,100%,.8);--k-color-sheer-white-900:hsla(0,0%,100%,.9);--k-color-sheer-white-950:hsla(0,0%,100%,.95);--k-color-black-12:rgb(0 0 0/12%);--k-color-black-20:rgb(0 0 0/20%);--k-color-black-6:rgb(0 0 0/6%);--k-color-black:#000;--k-color-blue-25:#f5faff;--k-color-blue-50:#eff8ff;--k-color-blue-100:#d1e9ff;--k-color-blue-200:#b2ddff;--k-color-blue-300:#84caff;--k-color-blue-400:#53b1fd;--k-color-blue-500:#2e90fa;--k-color-blue-600:#1570ef;--k-color-blue-700:#175cd3;--k-color-blue-800:#1849a9;--k-color-blue-900:#194185;--k-color-blue-dark-25:#f5f8ff;--k-color-blue-dark-50:#eff4ff;--k-color-blue-dark-100:#d1e0ff;--k-color-blue-dark-200:#b2ccff;--k-color-blue-dark-300:#84adff;--k-color-blue-dark-400:#528bff;--k-color-blue-dark-500:#2970ff;--k-color-blue-dark-600:#155eef;--k-color-blue-dark-700:#004eeb;--k-color-blue-dark-800:#0040c1;--k-color-blue-dark-900:#00359e;--k-color-blue-light-25:#f5fbff;--k-color-blue-light-50:#f0f9ff;--k-color-blue-light-100:#e0f2fe;--k-color-blue-light-200:#b9e6fe;--k-color-blue-light-300:#7cd4fd;--k-color-blue-light-400:#36bffa;--k-color-blue-light-500:#0ba5ec;--k-color-blue-light-600:#0086c9;--k-color-blue-light-700:#026aa2;--k-color-blue-light-800:#065986;--k-color-blue-light-900:#0b4a6f;--k-color-cyan-25:#f5feff;--k-color-cyan-50:#ecfdff;--k-color-cyan-100:#cff9fe;--k-color-cyan-200:#a5f0fc;--k-color-cyan-300:#67e3f9;--k-color-cyan-400:#2ce;--k-color-cyan-500:#06aed4;--k-color-cyan-600:#088ab2;--k-color-cyan-700:#0e7090;--k-color-cyan-800:#155b75;--k-color-cyan-900:#164c63;--k-color-error-25:#fffbfa;--k-color-error-50:#fef3f2;--k-color-error-100:#fee4e2;--k-color-error-200:#fecdca;--k-color-error-300:#fda29b;--k-color-error-400:#f97066;--k-color-error-500:#f04438;--k-color-error-600:#d92d20;--k-color-error-700:#b42318;--k-color-error-800:#912018;--k-color-error-900:#7a271a;--k-color-fuchsia-25:#fefaff;--k-color-fuchsia-50:#fdf4ff;--k-color-fuchsia-100:#fbe8ff;--k-color-fuchsia-200:#f6d0fe;--k-color-fuchsia-300:#eeaafd;--k-color-fuchsia-400:#e478fa;--k-color-fuchsia-500:#d444f1;--k-color-fuchsia-600:#ba24d5;--k-color-fuchsia-700:#9f1ab1;--k-color-fuchsia-800:#821890;--k-color-fuchsia-900:#6f1877;--k-color-gray-25:#fcfcfd;--k-color-gray-50:#f8fafc;--k-color-gray-100:#eef2f6;--k-color-gray-200:#e3e8ef;--k-color-gray-300:#cdd5df;--k-color-gray-400:#9aa4b2;--k-color-gray-500:#697586;--k-color-gray-600:#4b5565;--k-color-gray-700:#364152;--k-color-gray-800:#202939;--k-color-gray-900:#121926;--k-color-gray-base-25:#fcfcfd;--k-color-gray-base-50:#f9fafb;--k-color-gray-base-100:#f2f4f7;--k-color-gray-base-200:#eaecf0;--k-color-gray-base-300:#d0d5dd;--k-color-gray-base-400:#98a2b3;--k-color-gray-base-500:#667085;--k-color-gray-base-600:#475467;--k-color-gray-base-700:#344054;--k-color-gray-base-800:#1d2939;--k-color-gray-base-900:#101828;--k-color-gray-blue-25:#fcfcfd;--k-color-gray-blue-50:#f8f9fc;--k-color-gray-blue-100:#eaecf5;--k-color-gray-blue-200:#d5d9eb;--k-color-gray-blue-300:#b3b8db;--k-color-gray-blue-400:#717bbc;--k-color-gray-blue-500:#4e5ba6;--k-color-gray-blue-600:#3e4784;--k-color-gray-blue-700:#363f72;--k-color-gray-blue-800:#293056;--k-color-gray-blue-900:#101323;--k-color-gray-cool-25:#fcfcfd;--k-color-gray-cool-50:#f9f9fb;--k-color-gray-cool-100:#eff1f5;--k-color-gray-cool-200:#dcdfea;--k-color-gray-cool-300:#b9c0d4;--k-color-gray-cool-400:#7d89b0;--k-color-gray-cool-500:#5d6b98;--k-color-gray-cool-600:#4a5578;--k-color-gray-cool-700:#404968;--k-color-gray-cool-800:#30374f;--k-color-gray-cool-900:#111322;--k-color-gray-iron-25:#fcfcfc;--k-color-gray-iron-50:#fafafa;--k-color-gray-iron-100:#f4f4f5;--k-color-gray-iron-200:#e4e4e7;--k-color-gray-iron-300:#d1d1d6;--k-color-gray-iron-400:#a0a0ab;--k-color-gray-iron-500:#70707b;--k-color-gray-iron-600:#51525c;--k-color-gray-iron-700:#3f3f46;--k-color-gray-iron-800:#26272b;--k-color-gray-iron-900:#18181b;--k-color-gray-modern-25:#fcfcfd;--k-color-gray-modern-50:#f8fafc;--k-color-gray-modern-100:#eef2f6;--k-color-gray-modern-200:#e3e8ef;--k-color-gray-modern-300:#cdd5df;--k-color-gray-modern-400:#9aa4b2;--k-color-gray-modern-500:#697586;--k-color-gray-modern-600:#4b5565;--k-color-gray-modern-700:#364152;--k-color-gray-modern-800:#202939;--k-color-gray-modern-900:#121926;--k-color-gray-neutral-25:#fcfcfd;--k-color-gray-neutral-50:#f9fafb;--k-color-gray-neutral-100:#f3f4f6;--k-color-gray-neutral-200:#e5e7eb;--k-color-gray-neutral-300:#d2d6db;--k-color-gray-neutral-400:#9da4ae;--k-color-gray-neutral-500:#6c737f;--k-color-gray-neutral-600:#4d5761;--k-color-gray-neutral-700:#384250;--k-color-gray-neutral-800:#1f2a37;--k-color-gray-neutral-900:#111927;--k-color-gray-true-25:#fcfcfc;--k-color-gray-true-50:#fafafa;--k-color-gray-true-100:#f5f5f5;--k-color-gray-true-200:#e5e5e5;--k-color-gray-true-300:#d6d6d6;--k-color-gray-true-400:#a3a3a3;--k-color-gray-true-500:#737373;--k-color-gray-true-600:#525252;--k-color-gray-true-700:#424242;--k-color-gray-true-800:#292929;--k-color-gray-true-900:#141414;--k-color-gray-warm-25:#fdfdfc;--k-color-gray-warm-50:#fafaf9;--k-color-gray-warm-100:#f5f5f4;--k-color-gray-warm-200:#e7e5e4;--k-color-gray-warm-300:#d7d3d0;--k-color-gray-warm-400:#a9a29d;--k-color-gray-warm-500:#79716b;--k-color-gray-warm-600:#57534e;--k-color-gray-warm-700:#44403c;--k-color-gray-warm-800:#292524;--k-color-gray-warm-900:#1c1917;--k-color-green-25:#f6fef9;--k-color-green-50:#edfcf2;--k-color-green-100:#d3f8df;--k-color-green-200:#aaf0c4;--k-color-green-300:#73e2a3;--k-color-green-400:#3ccb7f;--k-color-green-500:#16b364;--k-color-green-600:#099250;--k-color-green-700:#087443;--k-color-green-800:#095c37;--k-color-green-900:#084c2e;--k-color-green-light-25:#fafef5;--k-color-green-light-50:#f3fee7;--k-color-green-light-100:#e3fbcc;--k-color-green-light-200:#d0f8ab;--k-color-green-light-300:#a6ef67;--k-color-green-light-400:#85e13a;--k-color-green-light-500:#66c61c;--k-color-green-light-600:#4ca30d;--k-color-green-light-700:#3b7c0f;--k-color-green-light-800:#326212;--k-color-green-light-900:#2b5314;--k-color-indigo-25:#f5f8ff;--k-color-indigo-50:#eef4ff;--k-color-indigo-100:#e0eaff;--k-color-indigo-200:#c7d7fe;--k-color-indigo-300:#a4bcfd;--k-color-indigo-400:#8098f9;--k-color-indigo-500:#6172f3;--k-color-indigo-600:#444ce7;--k-color-indigo-700:#3538cd;--k-color-indigo-800:#2d31a6;--k-color-indigo-900:#2d3282;--k-color-kong-12:rgb(240 68 56/12%);--k-color-kong-20:rgb(240 68 56/16%);--k-color-kong-40:rgb(240 68 56/40%);--k-color-kong:#f04438;--k-color-moss-25:#fafdf7;--k-color-moss-50:#f5fbee;--k-color-moss-100:#e6f4d7;--k-color-moss-200:#ceeab0;--k-color-moss-300:#acdc79;--k-color-moss-400:#86cb3c;--k-color-moss-500:#669f2a;--k-color-moss-600:#4f7a21;--k-color-moss-700:#3f621a;--k-color-moss-800:#335015;--k-color-moss-900:#2b4212;--k-color-orange-25:#fefaf5;--k-color-orange-50:#fef6ee;--k-color-orange-100:#fdead7;--k-color-orange-200:#f9dbaf;--k-color-orange-300:#f7b27a;--k-color-orange-400:#f38744;--k-color-orange-500:#ef6820;--k-color-orange-600:#e04f16;--k-color-orange-700:#b93815;--k-color-orange-800:#932f19;--k-color-orange-900:#772917;--k-color-orange-dark-25:#fff9f5;--k-color-orange-dark-50:#fff4ed;--k-color-orange-dark-100:#ffe6d5;--k-color-orange-dark-200:#ffd6ae;--k-color-orange-dark-300:#ff9c66;--k-color-orange-dark-400:#ff692e;--k-color-orange-dark-500:#ff4405;--k-color-orange-dark-600:#e62e05;--k-color-orange-dark-700:#bc1b06;--k-color-orange-dark-800:#97180c;--k-color-orange-dark-900:#771a0d;--k-color-pink-25:#fef6fb;--k-color-pink-50:#fdf2fa;--k-color-pink-100:#fce7f6;--k-color-pink-200:#fcceee;--k-color-pink-300:#faa7e0;--k-color-pink-400:#f670c7;--k-color-pink-500:#ee46bc;--k-color-pink-600:#dd2590;--k-color-pink-700:#c11574;--k-color-pink-800:#9e165f;--k-color-pink-900:#851651;--k-color-purple-25:#fafaff;--k-color-purple-50:#f4f3ff;--k-color-purple-100:#ebe9fe;--k-color-purple-200:#d9d6fe;--k-color-purple-300:#bdb4fe;--k-color-purple-400:#9b8afb;--k-color-purple-500:#7a5af8;--k-color-purple-600:#6938ef;--k-color-purple-700:#5925dc;--k-color-purple-800:#4a1fb8;--k-color-purple-900:#3e1c96;--k-color-rose-25:#fff5f6;--k-color-rose-50:#fff1f3;--k-color-rose-100:#ffe4e8;--k-color-rose-200:#fecdd6;--k-color-rose-300:#fea3b4;--k-color-rose-400:#fd6f8e;--k-color-rose-500:#f63d68;--k-color-rose-600:#e31b54;--k-color-rose-700:#c01048;--k-color-rose-800:#a11043;--k-color-rose-900:#89123e;--k-color-success-25:#f6fef9;--k-color-success-50:#ecfdf3;--k-color-success-100:#d1fadf;--k-color-success-200:#a6f4c5;--k-color-success-300:#6ce9a6;--k-color-success-400:#32d583;--k-color-success-500:#12b76a;--k-color-success-600:#039855;--k-color-success-700:#027a48;--k-color-success-800:#05603a;--k-color-success-900:#054f31;--k-color-teal-25:#f6fefc;--k-color-teal-50:#f0fdf9;--k-color-teal-100:#ccfbef;--k-color-teal-200:#99f6e0;--k-color-teal-300:#5fe9d0;--k-color-teal-400:#2ed3b7;--k-color-teal-500:#15b79e;--k-color-teal-600:#0e9384;--k-color-teal-700:#107569;--k-color-teal-800:#125d56;--k-color-teal-900:#134e48;--k-color-violet-25:#fbfaff;--k-color-violet-50:#f5f3ff;--k-color-violet-100:#ece9fe;--k-color-violet-200:#ddd6fe;--k-color-violet-300:#c3b5fd;--k-color-violet-400:#a48afb;--k-color-violet-500:#875bf7;--k-color-violet-600:#7839ee;--k-color-violet-700:#6927da;--k-color-violet-800:#5720b7;--k-color-violet-900:#491c96;--k-color-warning-25:#fffcf5;--k-color-warning-50:#fffaeb;--k-color-warning-100:#fef0c7;--k-color-warning-200:#fedf89;--k-color-warning-300:#fec84b;--k-color-warning-400:#fdb022;--k-color-warning-500:#f79009;--k-color-warning-600:#dc6803;--k-color-warning-700:#b54708;--k-color-warning-800:#93370d;--k-color-warning-900:#7a2e0e;--k-color-white-12:hsla(0,0%,100%,.12);--k-color-white-20:hsla(0,0%,100%,.2);--k-color-white:#fff;--k-color-yellow-25:#fefdf0;--k-color-yellow-50:#fefbe8;--k-color-yellow-100:#fef7c3;--k-color-yellow-200:#feee95;--k-color-yellow-300:#fde272;--k-color-yellow-400:#fac515;--k-color-yellow-500:#eaaa08;--k-color-yellow-600:#ca8504;--k-color-yellow-700:#a15c07;--k-color-yellow-800:#854a0e;--k-color-yellow-900:#713b12;--k-color-pressed-light:linear-gradient(0deg,var(--k-color-black-12),var(--k-color-black-12)),var(--k-color-gray-100);--k-color-pressed-dark:linear-gradient(0deg,var(--k-color-white-12),var(--k-color-white-12)),var(--k-color-gray-900);--k-color-pressed-kong:linear-gradient(0deg,var(--k-color-black-20),var(--k-color-black-20)),var(--k-color-kong);--k-focus-ring-3:3px;--k-focus-ring-4:4px;--k-focus-ring-kong-4:0 0 0 4px var(--k-color-kong);--k-focus-ring-transp-kong-4:0 0 0 4px var(--k-color-kong-40);--k-focus-ring-kong-6:0 0 0 6px var(--k-color-kong);--k-focus-ring-dark-4:0 0 0 4px var(--k-color-gray-900);--k-focus-ring-dark-6:0 0 0 6px var(--k-color-gray-900);--k-font-sans:inter,ui-sans-serif,system-ui,-apple-system,blinkmacsystemfont,segoe ui,roboto,helvetica neue,arial,noto sans,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol,noto color emoji;--k-font-size-xs:0.75rem;--k-font-size-sm:0.875rem;--k-font-size-md:1rem;--k-font-size-lg:1.125rem;--k-font-size-xl:1.25rem;--k-font-size-display-xs:1.5rem;--k-font-size-display-sm:1.875rem;--k-font-size-display-base:2.25rem;--k-font-size-display-md:2.25rem;--k-font-size-display-lg:3rem;--k-font-size-display-xl:3.75rem;--k-font-size-display-xxl:4.5rem;--k-font-weight-light:300;--k-font-weight-normal:400;--k-font-weight-medium:500;--k-font-weight-semibold:600;--k-font-weight-bold:700;--k-gradient-developer-45:linear-gradient(104.62deg,#2970ff 39.66%,#e478fa);--k-gradient-kong-45:linear-gradient(104.62deg,var(--k-color-kong) 39.66%,#e478fa 100%);--k-gradient-kong-fade:linear-gradient(180deg,#eeaafd 0%,var(--k-color-kong) 59.9%);--k-gradient-kong-glow:linear-gradient(180deg,var(--k-color-kong) 0%,#e478fa 100%);--k-line-height-xs:1.125rem;--k-line-height-sm:1.25rem;--k-line-height-md:1.5rem;--k-line-height-lg:1.75rem;--k-line-height-xl:1.875rem;--k-line-height-display-xs:1.5rem;--k-line-height-display-sm:2.375rem;--k-line-height-display-md:2.75rem;--k-line-height-display-lg:3.75rem;--k-line-height-display-xl:4.5rem;--k-line-height-display-xxl:5.625rem;--k-shadow-xs:0px 1px 2px rgb(0 0 0/5%);--k-shadow-sm:0px 1px 3px rgb(0 0 0/10%),0px 1px 2px rgb(0 0 0/6%);--k-shadow-md:0px 4px 8px -2px rgb(0 0 0/10%),0px 2px 4px -2px rgb(0 0 0/6%);--k-shadow-lg:0px 20px 24px -4px rgb(0 0 0/8%),0px 8px 8px -4px rgb(0 0 0/3%);--k-shadow-xl:0px 20px 24px -4px rgb(0 0 0/8%),0px 8px 8px -4px rgb(0 0 0/3%);--k-shadow-xxl:0px 24px 48px -12px rgb(0 0 0/18%);--k-shadow-xxxl:0px 32px 64px -12px rgb(0 0 0/14%);--k-size-px:0.0625rem;--k-size-0-5:0.125rem;--k-size-1:0.25rem;--k-size-1-5:0.375rem;--k-size-2:0.5rem;--k-size-2-5:0.625rem;--k-size-3:0.75rem;--k-size-3-5:0.875rem;--k-size-4:1rem;--k-size-5:1.25rem;--k-size-6:1.5rem;--k-size-7:1.75rem;--k-size-8:2rem;--k-size-9:2.25rem;--k-size-10:2.5rem;--k-size-11:2.75rem;--k-size-12:3rem;--k-size-14:3.5rem;--k-size-16:4rem;--k-size-20:5rem;--k-size-24:6rem;--k-size-28:7rem;--k-size-32:8rem;--k-size-36:9rem;--k-size-40:10rem;--k-size-44:11rem;--k-size-48:12rem;--k-size-52:13rem;--k-size-56:14rem;--k-size-60:15rem;--k-size-64:16rem;--k-size-72:18rem;--k-size-80:20rem;--k-size-96:24rem;--k-transition-x-slow:1000ms;--k-transition-slow:500ms;--k-transition-medium:250ms;--k-transition-fast:150ms;--k-transition-x-fast:100m;--k-z-index-10:10;--k-z-index-20:20;--k-z-index-30:30;--k-z-index-40:40;--k-z-index-50:50;--k-z-index-100:100}:host{-webkit-text-size-adjust:100%;font-feature-settings:normal;all:initial;box-sizing:border-box;color:inherit;font-family:var(--k-font-sans);line-height:var(--k-line-height-md);-moz-tab-size:4;-o-tab-size:4;tab-size:4}:host,:host *,:host :after,:host :before,:host:after,:host:before{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-smooth:always}:host *,:host :after,:host :before{box-sizing:inherit}[hidden]{display:none!important}:host ::slotted(*),:host slot{font-family:var(--k-font-sans)}.sr-only{clip:rect(0,0,0,0);border-width:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;white-space:nowrap;width:1px}`;
  var styles$1l = css_248z$1l;
  styleInject(css_248z$1l);

  const INTER_FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  /**
   * A base class for all Konstruct elements to extend.
   *
   * @property {string[]} fonts - A list of fonts that have been loaded by the element.
   *
   * @method loadFont - Loads a font and adds it to the `fonts` property. See: `FontController`.
   */
  class KonstructElement extends s$3 {
      constructor() {
          super(...arguments);
          this.fonts = [INTER_FONT_URL];
          this.hidden = false;
          this.componentId = `k-${v4()}`;
          this.fontsController = new FontController(this);
      }
      static { this.styles = [styles$1l]; }
      connectedCallback() {
          super.connectedCallback();
          this.setAttribute('k-id', this.componentId);
      }
      updated(...params) {
          super.updated(...params);
          this.setAttribute('k-id', this.componentId);
      }
      /**
       * Exposes the `loadFont` method to classes extending `KonstructElement`.
       */
      loadFont(font) {
          this.fontsController.loadFont(font);
      }
  }
  __decorate([
      t(),
      __metadata("design:type", Array)
  ], KonstructElement.prototype, "fonts", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], KonstructElement.prototype, "hidden", void 0);

  var css_248z$1k = i$6`:host,:host([theme=default]){--k-avatar-color:var(--k-color-gray-500);--k-avatar-stroke:transparent;--k-avatar-border-color:transparent;--k-avatar-border-width:0}:host([theme=reversed]){--k-avatar-stroke:var(--k-color-white)}:host{display:flex}.avatar{align-items:center;display:flex;font-size:inherit;justify-content:center;position:relative}.avatar--rounded{border-radius:9999px}.avatar--stroke{--k-avatar-border-width:1px}.avatar--stroke-light{--k-avatar-border-color:var(--k-color-white)}.avatar--stroke-dark{--k-avatar-border-color:var(--k-color-gray-800)}.avatar__content{align-items:center;border:var(--k-avatar-border-width) solid var(--k-avatar-border-color);color:var(--k-avatar-color);display:flex;height:100%;justify-content:center;line-height:1;overflow:hidden;padding-bottom:50%;position:relative;width:100%}:host([rounded]) .avatar__content{border-radius:9999px}.avatar__image{height:100%;inset:0;-o-object-fit:cover;object-fit:cover;position:absolute;width:100%}.avatar__initials{line-height:1;text-transform:uppercase}:host([size="20"]) .avatar__initials{font-size:var(--k-font-size-xs)}:host([size="24"]) .avatar__initials{font-size:var(--k-font-size-xs)}:host([size="32"]) .avatar__initials{font-size:var(--k-font-size-sm)}:host([size="36"]) .avatar__initials{font-size:var(--k-font-size-md)}:host([size="40"]) .avatar__initials{font-size:var(--k-font-size-lg)}:host([size="48"]) .avatar__initials{font-size:var(--k-font-size-xl)}:host([size="56"]) .avatar__initials{font-size:var(--k-font-size-display-xs)}:host([size="64"]) .avatar__initials{font-size:var(--k-font-size-display-sm)}:host([size="80"]) .avatar__initials{font-size:var(--k-font-size-display-md)}:host([size="96"]) .avatar__initials{font-size:var(--k-font-size-display-lg)}:host([size="128"]) .avatar__initials{font-size:var(--k-font-size-display-xl)}:host([size="160"]) .avatar__initials{font-size:var(--k-font-size-display-xl)}.avatar__status{background-color:var(--k-color-success-400);border-radius:9999px;bottom:3.91%;height:100%;position:absolute;right:3.91%;width:100%}`;
  var styles$1k = css_248z$1k;
  styleInject(css_248z$1k);

  /**
   * A component for displaying a user's avatar.
   *
   * @element k-avatar
   *
   * @csspart base - The component's base wrapper.
   * @csspart content - The content container of the avatar.
   * @csspart image - The image content of the avatar.
   * @csspart initials - The initials content of the avatar.
   * @csspart status - The status indicator of the avatar.
   */
  exports.Avatar = class Avatar extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The alt text for the avatar. */
          this.alt = 'User avatar';
          /** Whether the user is online. */
          this.online = false;
          /** Whether the avatar should be rounded. */
          this.rounded = false;
          /** The size of the avatar. Defaults to 48. */
          this.size = 48;
          this.icon = new SVGController(this, `${KONSTRUCT_ASSETS_PATH}/ui/avatars/person.svg`, {
              mutator: (svg) => {
                  svg.setAttribute('fill', 'currentColor');
                  svg.setAttribute('height', `${this.iconSize}px`);
                  svg.setAttribute('width', `${this.iconSize}px`);
                  Array.from(svg.getElementsByTagName('path')).forEach((path) => {
                      path.setAttribute('fill', 'currentColor');
                  });
              },
          });
      }
      static { this.styles = [KonstructElement.styles, styles$1k]; }
      get content() {
          if (this.src) {
              return x `<img @error="${this.handleImageError}" alt="${this.alt}" class="avatar__image" part="image" src="${this.src}">`;
          }
          if (this.initials) {
              return x `<span class="avatar__initials" exportparts="base:initials" part="initials">${this.initials}</span>`;
          }
          return this.icon.render();
      }
      /**
       * The size of the icon displayed by default as determined by the `size` attribute.
       */
      get iconSize() {
          return Math.ceil(this.size * 0.58);
      }
      /**
       * The size of the status indicator as determined by the `size` attribute.
       */
      get statusSize() {
          return Math.ceil(this.size * 0.2);
      }
      render() {
          return x `<div class="${classMap('avatar', {
            'avatar--rounded': this.rounded,
            'avatar--stroke': !!this.stroke,
            [`avatar--stroke-${this.stroke}`]: this.stroke,
        })}" part="base" style="${styleMap({
            height: `${this.size}px`,
            width: `${this.size}px`,
        })}"><slot class="avatar__content" part="content" style="${styleMap({
            backgroundColor: this.backgroundColor ?? undefined,
            color: this.color ?? undefined,
        })}">${this.content}</slot><slot name="status" part="status">${n$2(this.online, () => x `<span class="avatar__status" part="status" style="${styleMap({
            height: `${this.statusSize}px`,
            width: `${this.statusSize}px`,
        })}"></span>`)}</slot></div>`;
      }
      handleImageError() {
          console.error('Failed to load image from src:', this.src);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.Avatar.prototype, "alt", void 0);
  __decorate([
      n$5({
          attribute: 'background-color',
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Avatar.prototype, "backgroundColor", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Avatar.prototype, "color", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Avatar.prototype, "initials", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Avatar.prototype, "online", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Avatar.prototype, "rounded", void 0);
  __decorate([
      enumProperty({
          attribute: true,
          options: [20, 24, 32, 36, 40, 48, 56, 64, 80, 96, 128, 160],
      }),
      __metadata("design:type", Object)
  ], exports.Avatar.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Avatar.prototype, "src", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Avatar.prototype, "stroke", void 0);
  exports.Avatar = __decorate([
      customElement('avatar')
  ], exports.Avatar);

  var css_248z$1j = i$6`:host{display:flex}.avatar-label-group{align-items:center;display:flex;justify-content:center}.avatar-label-group--xs{gap:var(--k-size-1-5)}.avatar-label-group--sm{gap:var(--k-size-2-5)}.avatar-label-group--md{gap:var(--k-size-3)}.avatar-label-group--lg{gap:var(--k-size-4)}.avatar-label-group__heading{color:var(--k-color-gray-900);font-weight:var(--k-font-weight-semibold)}:host([size=xs]) .avatar-label-group__heading{font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}:host([size=sm]) .avatar-label-group__heading{font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}:host([size=md]) .avatar-label-group__heading{font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}:host([size=lg]) .avatar-label-group__heading{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}:host([size=xl]) .avatar-label-group__heading{font-size:var(--k-font-size-lg);line-height:var(--k-line-height-lg)}.avatar-label-group__subheading{color:var(--k-color-gray-500)}:host([size=xs]) .avatar-label-group__subheading{font-size:var(--k-font-size-xs);line-height:var(--k-line-height-xs)}:host([size=sm]) .avatar-label-group__subheading{font-size:var(--k-font-size-xs);line-height:var(--k-line-height-xs)}:host([size=md]) .avatar-label-group__subheading{font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}:host([size=lg]) .avatar-label-group__subheading{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}:host([size=xl]) .avatar-label-group__subheading{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.avatar-label-group__heading,.avatar-label-group__subheading{display:flex;line-height:1}.avatar-label-group__heading::slotted(*),.avatar-label-group__heading>*,.avatar-label-group__subheading::slotted(*),.avatar-label-group__subheading>*{line-height:inherit}.avatar-label-group__avatar{display:flex}`;
  var styles$1j = css_248z$1j;
  styleInject(css_248z$1j);

  /**
   * A component for displaying an avatar alongside a heading and subheading.
   *
   * @element k-avatar-label-group
   *
   * @property {'xs'|'sm'|'md'|'lg'|'xl'} size - The size of the avatar. The avatar in the avatar-label-group will be resized based on this value. Defaults to `md`.
   * @property {string} heading - The heading to display.
   * @property {string} subheading - The subheading to display.
   *
   * @slot - Slot for the `avatar` content. Only `avatar` elements are allowed.
   * @slot heading - Slot for the heading content.
   * @slot subheading - Slot for the subheading content in the avatar group.
   *
   * @csspart base - The component's base wrapper.
   */
  exports.AvatarLabelGroup = class AvatarLabelGroup extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$1j]; }
      constructor() {
          super();
          this.size = 'md';
          this.heading = '';
          this.subheading = '';
          this.slotController = new SlotController(this, {
              allow: [exports.Avatar],
              setAttrs: () => ({
                  size: this.avatarSize,
              }),
              slots: 'default',
          });
          this.addController(this.slotController);
      }
      get avatarSize() {
          switch (this.size) {
              case 'xs':
                  return 24;
              case 'sm':
                  return 32;
              case 'lg':
                  return 48;
              case 'xl':
                  return 56;
              case 'md':
              default:
                  return 40;
          }
      }
      render() {
          return x `<div class="${classMap({
            'avatar-label-group': true,
            [`avatar-label-group--${this.size}`]: true,
        })}" part="base"><slot class="avatar-label-group__avatar"></slot><div><slot class="avatar-label-group__heading" name="heading">${this.heading}</slot><slot class="avatar-label-group__subheading" name="subheading">${this.subheading}</slot></div></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.AvatarLabelGroup.prototype, "size", void 0);
  __decorate([
      n$5({ type: String }),
      __metadata("design:type", Object)
  ], exports.AvatarLabelGroup.prototype, "heading", void 0);
  __decorate([
      n$5({ type: String }),
      __metadata("design:type", Object)
  ], exports.AvatarLabelGroup.prototype, "subheading", void 0);
  exports.AvatarLabelGroup = __decorate([
      customElement('avatar-label-group'),
      __metadata("design:paramtypes", [])
  ], exports.AvatarLabelGroup);

  var css_248z$1i = i$6`.avatar-group{display:flex}`;
  var styles$1i = css_248z$1i;
  styleInject(css_248z$1i);

  /**
   * A component for displaying a group of avatars.
   *
   * @element k-avatar-group
   
   * @slot - Slot for the avatar content in the avatar group. Only `avatar` elements are allowed.
   *
   * @csspart base - The component's base wrapper.
   */
  exports.AvatarGroup = class AvatarGroup extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$1i]; }
      constructor() {
          super();
          /** Whether to show each avatar as rounded or not.  */
          this.rounded = false;
          /**
           * The size of the avatar group. The avatars in the group will be resized
           * based on this value. Defaults to `md`.
           */
          this.size = 'md';
          this.slotController = new SlotController(this, {
              allow: [exports.Avatar],
              forwardAttrs: ['stroke'],
              setAttrs: () => ({
                  rounded: this.rounded,
                  size: this.avatarSize,
                  stroke: this.stroke,
                  style: `margin-left: ${this.avatarMargin}px;`,
              }),
              slots: 'default',
          });
          this.addController(this.slotController);
      }
      /**
       * The margin value to apply to each avatar in the group.
       * With a negative value, the avatars stack on top of each other.
       */
      get avatarMargin() {
          switch (this.size) {
              case 'xs':
                  return -4;
              case 'sm':
                  return -8;
              case 'md':
              default:
                  return -12;
          }
      }
      get avatarSize() {
          switch (this.size) {
              case 'xs':
                  return 24;
              case 'sm':
                  return 32;
              case 'md':
              default:
                  return 40;
          }
      }
      render() {
          return x `<div class="avatar-group" part="base"><slot></slot></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.AvatarGroup.prototype, "rounded", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.AvatarGroup.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.AvatarGroup.prototype, "stroke", void 0);
  exports.AvatarGroup = __decorate([
      customElement('avatar-group'),
      __metadata("design:paramtypes", [])
  ], exports.AvatarGroup);

  var css_248z$1h = i$6`:host{display:inline-block}.avatar-badge--variant-avatar{align-items:center;background:var(--k-color-gray-900);border-radius:5px;color:var(--k-color-white);display:inline-flex;flex-shrink:0;font-size:var(--k-font-size-md);font-weight:var(--k-font-weight-semibold);height:20px;justify-content:center;line-height:var(--k-line-height-md);padding:1px 3px;text-align:center}.avatar-badge--variant-avatar.avatar-badge--theme-reversed{background:var(--k-color-white);color:var(--k-color-gray-900);font-weight:var(--k-font-weight-bold)}.avatar-badge--variant-avatar .avatar-badge__hash{text-align:right}.avatar-badge--variant-high-score{background:var(--k-color-rose-400);border-radius:4px;color:var(--k-color-gray-900);font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-semibold);height:16px;line-height:var(--k-line-height-sm);padding:0 2px}.avatar-badge--variant-high-score,.avatar-badge--variant-kreds{align-items:center;display:inline-flex;flex-shrink:0;justify-content:center}.avatar-badge--variant-kreds{background:var(--k-color-gray-900);border-radius:3px;box-shadow:var(--k-shadow-md);color:var(--k-color-white);font-size:12px;font-style:normal;font-weight:600;height:14px;letter-spacing:-.48px;line-height:18px;padding:1px 2px 0;text-align:center}.avatar-badge--variant-kreds.avatar-badge--theme-reversed{background:var(--k-color-white);color:var(--k-color-gray-800);font-weight:var(--k-font-weight-bold);padding:0 2px}`;
  var styles$1h = css_248z$1h;
  styleInject(css_248z$1h);

  /**
   * @element k-avatar-badge
   *
   * @csspart base - The component's base wrapper.
   * @csspart label - The text label for the avatar-badge.
   */
  exports.AvatarBadge = class AvatarBadge extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The avatar badge variant. */
          this.variant = 'avatar';
          /** The theme to display the avatar-badge in. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$1h]; }
      render() {
          return x `<div class="${classMap({
            'avatar-badge': true,
            [`avatar-badge--theme-${this.theme}`]: true,
            [`avatar-badge--variant-${this.variant}`]: true,
        })}" part="base">${n$2(this.variant == 'avatar', () => x `<div class="avatar-badge__hash">#</div>`)}<slot part="label"></slot></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.AvatarBadge.prototype, "variant", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.AvatarBadge.prototype, "theme", void 0);
  exports.AvatarBadge = __decorate([
      customElement('avatar-badge')
  ], exports.AvatarBadge);

  /**
   * A component for displaying heart-shaped Kongregate icons.
   *
   * @element k-kong-heart
   *
   * @csspart base - The component's base element.
   */
  exports.KongHeart = class KongHeart extends KonstructElement {
      constructor() {
          super(...arguments);
          this.alt = 'Kong Heart';
          this.iconName = 'default';
          this.width = 90;
          this.icon = new IconLibraryController(this, () => ({
              iconName: this.iconName,
              mutator: (svg) => {
                  svg.setAttribute('alt', this.alt);
                  svg.setAttribute('part', 'base');
                  svg.setAttribute('height', 'auto');
                  svg.setAttribute('width', `${this.width}px`);
              },
              path: `${KONSTRUCT_ASSETS_PATH}/ui/branded/kong-hearts`,
          }));
      }
      static { this.library = {
          path: 'assets/kong-hearts',
      }; }
      render() {
          return this.icon.render();
      }
  };
  __decorate([
      n$5({ type: String }),
      __metadata("design:type", Object)
  ], exports.KongHeart.prototype, "alt", void 0);
  __decorate([
      n$5({
          attribute: 'name',
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.KongHeart.prototype, "iconName", void 0);
  __decorate([
      n$5({ type: Number }),
      __metadata("design:type", Object)
  ], exports.KongHeart.prototype, "width", void 0);
  exports.KongHeart = __decorate([
      customElement('kong-heart')
  ], exports.KongHeart);

  /**
   * The Kongregate logo as an icon.
   *
   * @element k-kong-icon
   *
   * @csspart base - The component's base element.
   */
  exports.KongIcon = class KongIcon extends KonstructElement {
      constructor() {
          super(...arguments);
          this.alt = 'Kong Icon';
          /** Whether to display the shiny version of the icon. */
          this.shiny = false;
          /** The theme to display the wordmark in. */
          this.theme = 'reversed';
          /** The variant of the icon to display. */
          this.variant = 'reversed';
          /** The width to display the icon with. The height will match. */
          this.width = 90;
          this.icon = new IconLibraryController(this, () => ({
              iconName: this.iconName,
              mutator: (svg) => {
                  svg.setAttribute('alt', this.alt);
                  svg.setAttribute('part', 'base');
                  svg.setAttribute('height', `${this.width}px`);
                  svg.setAttribute('width', `${this.width}px`);
              },
              path: this.path,
          }));
      }
      get iconName() {
          if (this.shiny) {
              return 'shiny';
          }
          return this.theme;
      }
      get path() {
          if (this.variant === 'default') {
              return `${KONSTRUCT_ASSETS_PATH}/ui/branded/kong-icon`;
          }
          return `${KONSTRUCT_ASSETS_PATH}/ui/branded/kong-icon-${this.variant}`;
      }
      render() {
          return this.icon.render();
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.KongIcon.prototype, "alt", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.KongIcon.prototype, "shiny", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.KongIcon.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.KongIcon.prototype, "variant", void 0);
  __decorate([
      n$5({
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.KongIcon.prototype, "width", void 0);
  exports.KongIcon = __decorate([
      customElement('kong-icon')
  ], exports.KongIcon);

  /**
   * The Kongregate logo as a wordmark.
   *
   * @element k-kong-wordmark
   *
   * @csspart base - The component's base element.
   */
  exports.KongWordmark = class KongWordmark extends KonstructElement {
      constructor() {
          super(...arguments);
          this.alt = 'Kong Wordmark';
          /** Whether to display the shiny version of the wordmark. */
          this.shiny = false;
          /** The theme to display the wordmark in. */
          this.theme = 'reversed';
          /** The width of the logo. Defaults to 590. */
          this.width = 590;
          /** The height of the logo. Defaults to 50. */
          this.height = 50;
          this.icon = new IconLibraryController(this, () => ({
              iconName: this.theme,
              mutator: (svg) => {
                  svg.setAttribute('alt', this.alt);
                  svg.setAttribute('part', 'base');
                  svg.setAttribute('width', `${this.width}px`);
                  svg.setAttribute('height', `${this.height}px`);
              },
              path: `${KONSTRUCT_ASSETS_PATH}/ui/branded/kong-wordmark`,
          }));
      }
      render() {
          return this.icon.render();
      }
  };
  __decorate([
      n$5({ type: String }),
      __metadata("design:type", Object)
  ], exports.KongWordmark.prototype, "alt", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.KongWordmark.prototype, "shiny", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.KongWordmark.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.KongWordmark.prototype, "width", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.KongWordmark.prototype, "height", void 0);
  exports.KongWordmark = __decorate([
      customElement('kong-wordmark')
  ], exports.KongWordmark);

  var css_248z$1g = i$6`:host,:host([theme=default]){--k-splash-background-color:var(--k-color-gray-800)}:host([theme=reversed]){--k-splash-background-color:var(--k-color-gray-100)}:host([theme=kong]){--k-splash-background-color:var(--k-color-kong)}.kong-splash{align-items:center;background-color:var(--k-splash-background-color);display:flex;justify-content:center}.kong-splash slot[name=wordmark] kong-wordmark{max-width:80%}`;
  var styles$1g = css_248z$1g;
  styleInject(css_248z$1g);

  /**
   * A full-width splash with the Kongregate wordmark.
   *
   * @element k-kong-splash
   *
   * @csspart base - The component's base wrapper.
   * @csspart wordmark - The k-wordmark element.
   */
  exports.KongSplash = class KongSplash extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$1g]; }
      constructor() {
          super();
          this.height = 540;
          this.theme = 'reversed';
          this.addController(new SlotController(this, {
              allow: [exports.KongWordmark],
              forwardAttrs: ['theme'],
              slots: ['default'],
          }));
      }
      get wordmarkTheme() {
          return this.theme === 'reversed' ? 'reversed' : 'default';
      }
      render() {
          return x `<div class="kong-splash" part="base" style="${styleMap({ height: this.height })}"><k-kong-wordmark exportparts="base:wordmark" theme="${this.wordmarkTheme}"></k-kong-wordmark></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.KongSplash.prototype, "height", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.KongSplash.prototype, "theme", void 0);
  exports.KongSplash = __decorate([
      customElement('kong-splash'),
      __metadata("design:paramtypes", [])
  ], exports.KongSplash);

  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const e=Symbol.for(""),l=t=>{if((null==t?void 0:t.r)===e)return null==t?void 0:t._$litStatic$},o=t=>({_$litStatic$:t,r:e}),i=(t,...r)=>({_$litStatic$:r.reduce(((r,e,l)=>r+(t=>{if(void 0!==t._$litStatic$)return t._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${t}. Use 'unsafeStatic' to pass non-literal values, but\n            take care to ensure page security.`)})(e)+t[l+1]),t[0]),r:e}),s=new Map,a=t=>(r,...e)=>{const o=e.length;let i,a;const n=[],u=[];let c,$=0,f=!1;for(;$<o;){for(c=r[$];$<o&&void 0!==(a=e[$],i=l(a));)c+=i+r[++$],f=!0;$!==o&&u.push(a),n.push(c),$++;}if($===o&&n.push(r[o]),f){const t=n.join("$$lit$$");void 0===(r=s.get(t))&&(n.raw=n,s.set(t,r=n)),e=u;}return t(r,...e)},n=a(x);

  var css_248z$1f = i$6`.button.button--filled{--border-radius:6px;--shadow-size:var(--theme-shadow-size,5px)}.button.button--filled.button--default{--content-background-color:var(--k-color-gray-100);--font-color:var(--k-color-gray-900);--font-weight:var(--k-font-weight-bold);--shadow-background:var(--k-color-kong)}.button.button--filled.button--kong{--content-background-color:var(--k-color-kong);--font-color:var(--k-color-white);--font-weight:var(--k-font-weight-semibold);--shadow-background:var(--k-color-kong-40)}.button.button--filled.button--reversed{--content-background-color:var(--k-color-gray-900);--font-color:var(--k-color-white);--font-weight:var(--k-font-weight-semibold);--shadow-background:var(--k-color-kong)}.button.button--filled.button--disabled{--font-color:var(--k-color-gray-500)}.button.button--filled:not(.button--disabled):hover .button__contents{transform:translateX(calc(var(--shadow-size)*-1)) translateY(calc(var(--shadow-size)*-1))}.button.button--filled.button--sm{--content-gap:2px;--content-padding-block:6px;--content-padding-inline:8px;--font-size:var(--k-font-size-sm);--label-padding-inline:2px;--line-height:var(--k-line-height-sm);--shadow-size:3px}.button.button--filled.button--md{--content-gap:3px;--content-padding-block:8px;--content-padding-inline:12px;--font-size:var(--k-font-size-md);--label-padding-inline:3px;--line-height:var(--k-line-height-md)}.button.button--filled.button--lg{--content-gap:3px;--content-padding-block:10px;--content-padding-inline:14px;--font-size:var(--k-font-size-base);--label-padding-inline:3px;--line-height:var(--k-line-height-md)}.button.button--filled.button--xl{--content-gap:3px;--content-padding-block:11px;--content-padding-inline:16px;--font-size:var(--k-font-size-lg);--label-padding-inline:4px;--line-height:var(-k-line-height-lg)}.button.button--filled.button--xxl{--content-gap:4px;--content-padding-block:13px;--content-padding-inline:18px;--font-size:var(--k-font-size-xl);--label-padding-inline:4px;--line-height:var(--k-line-height-xl)}.button.button--inline{isolation:isolate}.button.button--inline.button--disabled{--font-color:var(--k-color-gray-500)}.button.button--inline .button__contents{padding-block:0;padding-inline:0}.button.button--inline.button--xs{--content-gap:2px;--font-color:var(--k-color-gray-500);--font-size:var(--k-font-size-xs);--font-weight:var(--k-font-weight-medium);--line-height:var(--k-line-height-sm)}.button.button--inline.button--xs:after{background-color:transparent;block-size:1px;content:"";inline-size:100%;inset-block-start:15px;inset-inline:0;opacity:0;position:absolute;z-index:1}.button.button--inline.button--xs.button--active:after{opacity:0}.button.button--inline.button--xs:not(.button--disabled):focus-visible:after{background-color:var(--k-color-kong);opacity:1}.button.button--inline.button--xs:not(.button--disabled):hover:after{background-color:var(--k-color-gray-500);opacity:1}.button.button--inline.button--sm{--content-gap:4px;--font-color:var(--k-color-gray-900);--font-size:var(--k-font-size-sm);--font-weight:var(--k-font-weight-bold);--line-height:var(--k-line-height-sm)}.button.button--inline.button--sm.button--active{--font-color:var(--k-color-gray-900)}.button.button--inline.button--sm:not(.button--disabled):focus-visible{--font-color:var(--k-color-kong)}.button.button--inline.button--md{--content-gap:6px;--font-color:var(--k-color-gray-900);--font-size:var(--k-font-size-md);--font-weight:var(--k-font-weight-bold);--line-height:var(--k-line-height-md)}.button.button--inline.button--md.button--active{--background-border-block-size:5px;--background-border-inline-size:5px;--background:var(--k-color-pressed-light);--content-box-shadow:none}.button.button--inline.button--md:not(.button--disabled):focus-visible{--background-border-block-size:5px;--background-border-inline-size:5px;--background:var(--k-color-kong);--font-color:var(--k-color-white)}.button.button--inline.button--md:not(.button--disabled):hover{--content-box-shadow:0 3px 0 var(--k-color-gray-900)}.button.button--inline.button--lg{--content-gap:6px;--font-color:var(--k-color-gray-900);--font-size:var(--k-font-size-base);--font-weight:var(--k-font-weight-bold);--line-height:var(--k-line-height-md)}.button.button--inline.button--lg.button--active{--background-border-block-size:6px;--background-border-inline-size:6px;--background:var(--k-color-pressed-light);--content-box-shadow:none}.button.button--inline.button--lg:not(.button--disabled):hover{--content-box-shadow:0 3px 0 var(--k-color-gray-900)}.button.button--inline.button--lg:not(.button--disabled):focus-visible{--background-border-block-size:6px;--background-border-inline-size:6px;--background:var(--k-color-kong);--font-color:var(--k-color-white)}.button.button--unfilled{--content-padding-inline:0}.button.button--unfilled.button--active{--background:var(--k-color-pressed-light);--content-box-shadow:unset;--font-color:var(--k-color-white)}.button.button--unfilled.button--disabled{--font-color:var(--k-color-gray-500)}.button.button--unfilled:not(.button--disabled):focus-visible{--background:var(--k-color-kong);--content-box-shadow:unset;--font-color:var(--k-color-white)}.button.button--unfilled:not(.button--disabled):hover{--content-box-shadow:inset 0 -3px 0 var(--k-color-gray-900)}.button.button--unfilled.button--sm{--content-gap:4px;--content-padding-block:6px;--content-padding-inline:0;--font-size:var(--k-font-size-sm);--font-weight:var(--k-font-weight-bold);--line-height:var(--k-line-height-sm)}.button.button--unfilled.button--sm.button--active{--background-border-inline-size:7px}.button.button--unfilled.button--sm:not(.button--disabled):focus-visible{--background-border-inline-size:7px}.button.button--unfilled.button--md{--content-gap:6px;--content-padding-block:5px;--font-size:var(--k-font-size-md);--font-weight:var(--k-font-weight-bold);--line-height:var(--k-line-height-md)}.button.button--unfilled.button--md.button--active{--background-border-inline-size:6px}.button.button--unfilled.button--md:not(.button--disabled):focus-visible{--background-border-inline-size:6px}.button.button--unfilled.button--lg{--content-gap:6px;--content-padding-block:5px;--font-size:var(--k-font-size-base);--font-weight:var(--k-font-weight-bold);--line-height:var(--k-line-height-md)}.button.button--unfilled.button--lg.button--active{--background-border-inline-size:6px}.button.button--unfilled.button--lg:not(.button--disabled):focus-visible{--background-border-inline-size:6px}.button.button--unfilled.button--xl{--content-gap:6px;--content-padding-block:5px;--font-size:var(--k-font-size-lg);--font-weight:var(--k-font-weight-bold);--line-height:var(-k-line-height-lg)}.button.button--unfilled.button--xl.button--active{--background-border-inline-size:6px}.button.button--unfilled.button--xl:not(.button--disabled):focus-visible{--background-border-inline-size:6px}.button.button--unfilled.button--xxl{--content-gap:8px;--content-padding-block:5px;--font-size:var(--k-font-size-xl);--font-weight:var(--k-font-weight-bold);--line-height:var(--k-line-height-xl)}.button.button--unfilled.button--xxl.button--active{--background-border-inline-size:5px}.button.button--unfilled.button--xxl:not(.button--disabled):focus-visible{--background-border-inline-size:5px}:host{--theme-background-color:initial;--theme-border-radius:initial;--theme-font-color:initial;--theme-font-weight:initial;--theme-shadow-color:initial;--theme-shadow-size:initial;cursor:pointer;display:inline-block;position:relative;width:auto}.button{--border-radius:inherit;--font-color:inherit;--line-height:inherit;--font-size:inherit;--font-weight:inherit;--content-padding-block:0;--content-padding-inline:0;--shadow-size:0px;align-items:stretch;background-color:transparent;border:none;box-sizing:border-box;color:var(--theme-font-color,var(--font-color));cursor:inherit;display:inline-flex;font-family:var(--k-font-sans);font-size:var(--font-size);font-weight:var(--theme-font-weight,var(--font-weight));justify-content:center;line-height:var(--line-height);padding:0;position:relative;text-decoration:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;vertical-align:middle;white-space:nowrap;width:100%}.button::-moz-focus-inner{border:0}.button:focus{outline:0}.button.button--disabled{cursor:not-allowed}.button.button--disabled *{pointer-events:none}.button__contents{align-items:center;background-color:var(--theme-background-color,var(--content-background-color,transparent));border-radius:var(--theme-border-radius,var(--border-radius));box-shadow:var(--content-box-shadow,initial);display:flex;font-size:inherit;inline-size:100%;justify-content:center;padding-block:var(--content-padding-block,0);padding-inline:var(--content-padding-inline,0);position:relative;transition:transform .15s cubic-bezier(.4,0,.2,1)}.button__label{display:inline-block;padding-block:var(--label-padding-block,0);padding-inline:var(--label-padding-inline,0)}.button__shadow{background-color:var(--theme-shadow-color,var(--shadow-background,transparent));border-radius:var(--theme-border-radius,var(--border-radius));inset:0;position:absolute}.button__leading,.button__trailing{align-items:center;display:flex;flex:0 0 auto;font-size:inherit;pointer-events:none}.button__leading::slotted(*){margin-inline-end:var(--content-gap,0)}.button__leading::slotted(*){margin-inline-start:var(--content-gap,0)}.button:not(.button--disabled):not(.button--xs) .button__contents:after{background:var(--background,none);content:"";height:calc(100% + (var(--background-border-block-size,0px))*2);inset-block-start:calc((var(--background-border-block-size,0px))*-1);inset-inline-start:calc((var(--background-border-inline-size,0px))*-1);position:absolute;width:calc(100% + (var(--background-border-inline-size,0px))*2);z-index:-1}`;
  var styles$1f = css_248z$1f;
  styleInject(css_248z$1f);

  /**
   * A Button is an interactive element activated by a user, which
   *   performs an action, such as submitting a form or opening a dialog.
   *
   * @element k-button
   *
   * @slot - The button label.
   * @slot leading - A presentational element that will be prepended to the button
   *  contents, such as an icon or similar.
   * @slot trailing - A presentational element that will be appended to the button
   *  contents, such as an icon or similar.
   *
   * @csspart base - The base element container.
   */
  exports.Button = class Button extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Disables the button */
          this.disabled = false;
          /** The button is filled with color. */
          this.filled = false;
          /**
           * A button can contain only an icon, but its internal spacing needs to
           * be adjusted when doing so.
           */
          this.iconOnly = false;
          /** An inline button aligns well with surrounding text content. */
          this.inline = false;
          /** The button theme. */
          this.theme = 'reversed';
          /**
           * The button type. Please note the default is "button", and not "submit",
           * which is the default for native button elements.
           */
          this.type = 'button';
          /** The button size. */
          this.size = 'md';
          this.hasFocus = false;
          this.hrefAttribute = i `href`;
          /**
           * Necessary for form functionality to work (i.e: when using a submit button).
           *
           * We allow for undefined because the jest dom testing
           * environment does not include element internals.
           *
           * @see https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
           */
          this.internals = this.attachInternals?.();
      }
      static { this.styles = [KonstructElement.styles, styles$1f]; }
      /** Necessary for form functionality to work when type = submit. */
      static { this.formAssociated = true; }
      get isLink() {
          return this.href ? true : false;
      }
      get tag() {
          if (this.isLink) {
              return i `a`;
          }
          else {
              return i `button`;
          }
      }
      connectedCallback() {
          super.connectedCallback();
          this.handleHostClick = this.handleHostClick.bind(this);
          this.addEventListener('click', this.handleHostClick);
      }
      disconnectedCallback() {
          super.disconnectedCallback();
          this.removeEventListener('click', this.handleHostClick);
      }
      render() {
          return n `
      <${this.tag}
        class=${classMap('button', `button--${this.size}`, `button--${this.theme}`, {
            'button--disabled': this.disabled,
            'button--filled': this.filled && !this.inline,
            'button--focused': this.hasFocus,
            'button--icon-only': this.iconOnly,
            'button--inline': this.inline,
            'button--unfilled': !this.filled && !this.inline,
        })}
        ${this.hrefAttribute}=${l$2(this.href)}
        ?disabled=${l$2(this.isLink ? undefined : this.disabled)}
        part="base"
        target=${l$2(this.target)}
        type=${l$2(this.isLink ? undefined : this.type)}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
      >
        <span class="button__shadow"></span>
        <span class="button__contents">
          <slot name="leading" class="button__leading"></slot>
          <slot class="button__label"></slot>
          <slot name="trailing" class="button__trailing"></slot>
        </span>
      </${this.tag}>
    `;
      }
      handleBlur() {
          this.hasFocus = false;
      }
      handleFocus() {
          this.hasFocus = true;
      }
      handleHostClick(event) {
          if (this.disabled) {
              event.preventDefault();
              event.stopImmediatePropagation();
          }
          /** Attempts to submit the parent form (if any) when the button type is submit. */
          if (!this.disabled && this.type === 'submit') {
              this.internals?.form?.requestSubmit();
          }
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Button.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Button.prototype, "href", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Button.prototype, "filled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Button.prototype, "iconOnly", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Button.prototype, "inline", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Button.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Button.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Button.prototype, "type", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Button.prototype, "size", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.Button.prototype, "hasFocus", void 0);
  exports.Button = __decorate([
      customElement('button')
  ], exports.Button);

  var css_248z$1e = i$6`:host{--theme-background-active:initial;--theme-background-hover:initial;--theme-background:initial;--theme-border-radius:initial;--theme-box-shadow-focus:initial;--theme-font-color-active:initial;--theme-font-color:initial;--theme-font-weight:initial;cursor:pointer;display:inline-flex;position:relative;width:auto}:host([full]){display:flex;width:100%}.action-button{--action-button-background-active:initial;--action-button-background-hover:initial;--action-button-background:initial;--action-button-border-radius:6px;--action-button-box-shadow-focus:transparent;--action-button-font-color-active:inherit;--action-button-font-color:inherit;--action-button-font-weight:inherit;--action-button-gap:8px;--action-button-padding-block:0;--action-button-padding-inline:0;align-items:stretch;background:0 0;border:none;border-radius:var(--theme-border-radius,var(--action-button-border-radius));box-sizing:border-box;color:var(--theme-font-color,var(--action-button-font-color));cursor:inherit;display:inline-flex;font-family:var(--k-font-sans);font-size:var(--font-size);font-weight:var(--theme-font-weight,var(--action-button-font-weight));inline-size:100%;justify-content:center;padding:0;position:relative;text-decoration:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;vertical-align:middle;white-space:nowrap}.action-button::-moz-focus-inner{border:0}.action-button:focus{outline:0}.action-button.action-button--disabled{cursor:not-allowed}.action-button.action-button--disabled *{pointer-events:none}.action-button--disabled{cursor:not-allowed}.action-button--full{width:100%}.action-button--mini{--action-button-gap:0;--action-button-padding-block:var(--k-size-2-5);--action-button-padding-inline:var(--k-size-2-5)}.action-button:not(.action-button--mini){--action-button-padding-block:var(--k-size-2-5);--action-button-padding-inline:var(--k-size-3)}.action-button:not(.action-button--disabled):hover .action-button__content{background:var(--theme-background-hover,var(--action-button-background-hover,transparent))}.action-button:not(.action-button--disabled):active .action-button__content{background:var(--theme-background-active,var(--action-button-background-active,transparent));color:var(--theme-font-color-active,var(--action-button-font-color-active,inherit))}.action-button:not(.action-button--disabled):not(:active):focus-visible{box-shadow:var(--theme-box-shadow-focus,var(--action-button-box-shadow-focus,initial))}.action-button--theme-default{--action-button-background-active:var(--k-color-pressed-light);--action-button-background-hover:var(--k-color-gray-200);--action-button-background:var(--k-color-gray-100);--action-button-box-shadow-focus:var(--k-focus-ring-kong-4);--action-button-font-color-active:var(--k-color-gray-700);--action-button-font-color:var(--k-color-gray-900);--action-button-font-weight:700}.action-button--theme-kong{--action-button-background-active:var(--k-color-pressed-dark);--action-button-background-hover:var(--k-color-pressed-kong);--action-button-background:var(--k-color-kong);--action-button-box-shadow-focus:var(--k-focus-ring-transp-kong-4);--action-button-font-color-active:var(--k-color-gray-400);--action-button-font-color:var(--k-color-white);--action-button-font-weight:600}.action-button--theme-reversed{--action-button-background-active:var(--k-color-pressed-dark);--action-button-background-hover:var(--k-color-gray-700);--action-button-background:var(--k-color-gray-900);--action-button-box-shadow-focus:var(--k-focus-ring-kong-4);--action-button-font-color-active:var(--k-color-gray-400);--action-button-font-color:var(--k-color-white);--action-button-font-weight:600}.action-button__content{align-items:center;background:var(--theme-background,var(--action-button-background,transparent));border-radius:var(--theme-border-radius,var(--action-button-border-radius));display:flex;font-size:inherit;inline-size:100%;justify-content:center;padding-block:var(--action-button-padding-block,0);padding-inline:var(--action-button-padding-inline,0);position:relative;transition:transform .15s cubic-bezier(.4,0,.2,1)}.action-button__label{display:inline-block;font-size:var(--k-font-size-sm);font-weight:var(--action-button-font-weight);line-height:var(--k-line-height-sm)}.action-button__loading{font-size:20px}.action-button__leading,.action-button__trailing{align-items:center;display:flex;flex:0 0 auto;font-size:20px;pointer-events:none}.action-button__leading::slotted(*){margin-inline-end:var(--action-button-gap)}.action-button__trailing::slotted(*){margin-inline-start:var(--action-button-gap)}`;
  var styles$1e = css_248z$1e;
  styleInject(css_248z$1e);

  /**
   * @element k-action-button
   *
   * @slot - The button label.
   * @slot leading - A presentational element that will be prepended to the button
   *  contents, such as an icon or similar.
   * @slot trailing - A presentational element that will be appended to the button
   *  contents, such as an icon or similar.
   *
   * @csspart base - The base element container.
   */
  exports.ActionButton = class ActionButton extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Disables the button. */
          this.disabled = false;
          /** Whether the button takes up all available space. */
          this.full = false;
          /* Show a spinner to indicate the action is in progress. */
          this.loading = false;
          /**
           * A button can contain only an icon, but its internal spacing needs to
           * be adjusted when doing so.
           */
          this.mini = false;
          /** The theme to display the action-button in. */
          this.theme = 'reversed';
          /**
           * The button type. Please note the default is "button", and not "submit",
           * which is the default for native button elements.
           */
          this.type = 'button';
          this.hasFocus = false;
          /**
           * Necessary for form functionality to work (i.e: when using a submit button).
           *
           * We allow for undefined because the jest dom testing
           * environment does not include element internals.
           *
           * @see https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
           */
          this.internals = this.attachInternals?.();
          this.hrefAttribute = i `href`;
      }
      static { this.styles = [KonstructElement.styles, styles$1e]; }
      /** Necessary for form functionality to work when type = submit. */
      static { this.formAssociated = true; }
      get isLink() {
          return this.href ? true : false;
      }
      get loadingTheme() {
          const themes = {
              default: 'dark',
              kong: 'light',
              reversed: 'light',
          };
          return themes[this.theme];
      }
      get tag() {
          if (this.isLink) {
              return i `a`;
          }
          else {
              return i `button`;
          }
      }
      connectedCallback() {
          super.connectedCallback();
          this.handleHostClick = this.handleHostClick.bind(this);
          this.addEventListener('click', this.handleHostClick);
      }
      disconnectedCallback() {
          super.disconnectedCallback();
          this.removeEventListener('click', this.handleHostClick);
      }
      render() {
          return n `
      <${this.tag}
        class=${classMap('action-button', {
            [`action-button--theme-${this.theme}`]: this.theme,
            'action-button--disabled': this.disabled,
            'action-button--focused': this.hasFocus,
            'action-button--full': this.full,
            'action-button--mini': this.mini,
        })}
        ${this.hrefAttribute}=${l$2(this.href)}
        ?disabled=${this.isLink ? undefined : this.disabled}
        part="base"
        target=${l$2(this.target)}
        type=${l$2(this.isLink ? undefined : this.type)}
        @blur=${this.handleBlur}
        @click=${this.handleClick}
        @focus=${this.handleFocus}
      >
        <div class="action-button__content">
          ${n$2(this.loading, () => n `<k-spinner
                class="action-button__loading"
                theme="${this.loadingTheme}"
              ></k-spinner>`, () => n `<slot
                  name="leading"
                  class="action-button__leading"
                ></slot>
                <slot
                  class="action-button__label"
                  part="label"
                ></slot>
                <slot
                  name="trailing"
                  class="action-button__trailing"
                ></slot>`)}
        </div>
      </${this.tag}>
    `;
      }
      handleBlur() {
          this.hasFocus = false;
      }
      handleFocus() {
          this.hasFocus = true;
      }
      handleClick() { }
      handleHostClick(event) {
          if (this.disabled) {
              event.preventDefault();
              event.stopImmediatePropagation();
          }
          /** Attempts to submit the parent form (if any) when the button type is submit. */
          if (!this.disabled && this.type === 'submit') {
              this.internals?.form?.requestSubmit();
          }
      }
  };
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.ActionButton.prototype, "disabled", void 0);
  __decorate([
      n$5({ reflect: true, type: String }),
      __metadata("design:type", String)
  ], exports.ActionButton.prototype, "href", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.ActionButton.prototype, "full", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.ActionButton.prototype, "loading", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.ActionButton.prototype, "mini", void 0);
  __decorate([
      n$5({ reflect: true, type: String }),
      __metadata("design:type", String)
  ], exports.ActionButton.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ActionButton.prototype, "theme", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", String)
  ], exports.ActionButton.prototype, "type", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.ActionButton.prototype, "hasFocus", void 0);
  exports.ActionButton = __decorate([
      customElement('action-button')
  ], exports.ActionButton);

  var css_248z$1d = i$6`:host{display:block}.check-icon{cursor:pointer;position:relative;-webkit-user-select:none;-moz-user-select:none;user-select:none}.check-icon--disabled{cursor:not-allowed}.check-icon__inlay{border-radius:var(--k-size-3);inset:-1px;position:absolute}`;
  var styles$1d = css_248z$1d;
  styleInject(css_248z$1d);

  /**
   * A check-icon is a checkbox with an icon representation.
   *
   * @element k-check-icon
   *
   * @csspart base - The base element container.
   * @csspart icon - The indicator icon element. This is a `konstruct-indicator-icon`
   * component, which inherits its values from this component.
   *
   * @event k-blur - Dispatched when the checkbox loses focus.
   * @event k-change - Dispatched when the checked state changes.
   * @event k-focus - Dispatched when the checkbox gains focus.
   * @event k-input - Dispatched when the checkbox receives input.
   */
  exports.CheckIcon = class CheckIcon extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Indicates if the group is checked or not. */
          this.checked = false;
          /** Disables the checkbox. */
          this.disabled = false;
          /** The name of the checkbox input. */
          this.name = '';
          /** Indicates if the checkbox should be a required field. */
          this.required = false;
          /** The checkbox element's size. */
          this.size = 'md';
          /** The indicator's theme. */
          this.theme = 'reversed';
          /** Set a descriptive title for the checkbox. */
          this.title = '';
          /** The value of the checkbox input. */
          this.value = '';
          /** The variant of icon to be displayed. */
          this.variant = 'check';
          this.hasFocus = false;
      }
      static { this.styles = [KonstructElement.styles, styles$1d]; }
      blur() {
          this.input.blur();
      }
      click() {
          this.input.click();
      }
      firstUpdated() {
          this.handleInput();
      }
      focus(options) {
          this.input.focus(options);
      }
      render() {
          return x `<label class="${classMap({
            'check-icon': true,
            'check-icon--checked': this.checked,
            'check-icon--disabled': this.disabled,
            'check-icon--focused': this.hasFocus,
            [`check-icon--${this.size}`]: true,
        })}" part="base"><input aria-checked="${this.checked ? 'true' : 'false'}" class="sr-only" name="${this.name}" title="${this.title}" type="checkbox" value="${l$2(this.value)}" .checked="${l$1(this.checked)}" .disabled="${this.disabled}" .required="${this.required}" @blur="${this.handleBlur}" @click="${this.handleClick}" @focus="${this.handleFocus}" @input="${this.handleInput}"><k-indicator-icon ?active="${this.checked}" class="check-icon__indicator-icon" part="icon" size="${this.size}" theme="${this.theme}" variant="${this.variant}"></k-indicator-icon><span class="check-icon__inlay" aria-hidden="true"></span></label>`;
      }
      updated(changedProperties) {
          if (changedProperties.has('checked')) {
              this.handleStateChange();
          }
      }
      handleBlur() {
          this.hasFocus = false;
          const blurEvent = new CustomEvent('k-blur', {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(blurEvent);
      }
      handleClick() {
          this.checked = !this.checked;
          const changeEvent = new CustomEvent('k-change', {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(changeEvent);
      }
      handleFocus() {
          this.hasFocus = true;
          const focusEvent = new CustomEvent('k-focus', {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(focusEvent);
      }
      handleInput() {
          const inputEvent = new CustomEvent('k-input', {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(inputEvent);
      }
      handleStateChange() {
          this.input.checked = this.checked;
      }
  };
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.CheckIcon.prototype, "checked", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.CheckIcon.prototype, "disabled", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.CheckIcon.prototype, "name", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.CheckIcon.prototype, "required", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.CheckIcon.prototype, "size", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.CheckIcon.prototype, "theme", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.CheckIcon.prototype, "title", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.CheckIcon.prototype, "value", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.CheckIcon.prototype, "variant", void 0);
  __decorate([
      i$2('input[type="checkbox"]'),
      __metadata("design:type", HTMLInputElement)
  ], exports.CheckIcon.prototype, "input", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.CheckIcon.prototype, "hasFocus", void 0);
  exports.CheckIcon = __decorate([
      customElement('check-icon')
  ], exports.CheckIcon);

  var css_248z$1c = i$6`:host{display:block}.checkbox-group-item{align-items:flex-start;background-color:var(--k-color-white);border:1px solid var(--k-color-gray-200);border-radius:var(--k-size-3);cursor:pointer;display:flex;flex-direction:row;gap:var(--k-size-1);padding:var(--k-size-4);position:relative}.checkbox-group-item:hover{border-color:var(--k-color-gray-300)}.checkbox-group-item--checked{background-color:var(--k-color-gray-50)}.checkbox-group-item--checked.checkbox-group-item--sm{border-color:var(--k-color-kong);box-shadow:inset 0 0 0 1px var(--k-color-kong)}.checkbox-group-item--checked.checkbox-group-item--md{border-color:var(--k-color-gray-600);box-shadow:inset 0 0 0 1px var(--k-color-gray-600)}.checkbox-group-item:not(.checkbox-group-item--disabled).checkbox-group-item--checked:hover{background-color:var(--k-color-gray-50);border-color:var(--k-color-gray-600);box-shadow:inset 0 0 0 1px var(--k-color-gray-600)}.checkbox-group-item:not(.checkbox-group-item--disabled):focus-within{border-color:var(--k-color-gray-300);box-shadow:var(--k-focus-ring-kong-4)}.checkbox-group-item:not(.checkbox-group-item--disabled).checkbox-group-item--checked:focus-visible,.checkbox-group-item:not(.checkbox-group-item--disabled).checkbox-group-item--checked:focus-within{border-color:var(--k-color-gray-600);box-shadow:var(--k-focus-ring-kong-4)}.checkbox-group-item__indicator-icon{pointer-events:none}.checkbox-group-item:not(.checkbox-group-item--disabled).checkbox-group-item--checked:focus-visible .checkbox-group-item__indicator-icon,.checkbox-group-item:not(.checkbox-group-item--disabled).checkbox-group-item--checked:focus-within .checkbox-group-item__indicator-icon{border-radius:100px;box-shadow:0 0 0 1px var(--k-color-gray-900)}.checkbox-group-item.checkbox-group-item--disabled{background-color:var(--k-color-gray-50);border-color:var(--k-color-gray-200);box-shadow:inset 0 0 0 1px var(--k-color-gray-200);cursor:not-allowed}.checkbox-group-item--sm{font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}.checkbox-group-item--md{font-size:var(--k-font-size-base);line-height:var(--k-line-height-base)}.checkbox-group-item__actions::slotted(*){align-items:flex-start;display:flex;gap:var(--k-size-2)}.checkbox-group-item__container{align-items:flex-start;display:flex;gap:var(--k-size-3);inline-size:100%}.checkbox-group-item__content{align-items:flex-start;display:flex;flex-direction:column;flex-grow:1;font-weight:var(--k-font-weight-normal);gap:var(--k-size-3);padding:0}.checkbox-group-item__inlay{border-radius:var(--k-size-3);inset:-1px;pointer-events:none;position:absolute}.checkbox-group-item__leading{display:block;width:46px}.checkbox-group-item__text::slotted(*){align-items:flex-start;display:flex;flex-direction:column}.checkbox-group-item--md .checkbox-group-item__text::slotted(*){gap:var(--k-size-0-5)}k-indicator-icon::part(icon){pointer-events:none}`;
  var styles$1c = css_248z$1c;
  styleInject(css_248z$1c);

  /**
   * A Checkbox Group Item provides a visual banner with additional
   * information and visual cues that represent if a checkbox is checked or not.
   *
   * @element k-checkbox-group-item
   *
   * @slot - The group content.
   * @slot actions - Additional group actions.
   * @slot leading - A presentational element prepended to the group.
   *
   * @event k-blur - Dispatched when the checkbox loses focus.
   * @event k-change - Dispatched when the checked state changes.
   * @event k-focus - Dispatched when the checkbox gains focus.
   * @event k-input - Dispatched when the checkbox receives input.
   *
   * @csspart base - The base wrapper element.
   * @csspart actions - The actions element wrapper.
   * @csspart indicator-icon - The indicator icon element.
   * @csspart leading - The wrapping container of the leading element.
   * @csspart text - The primary text content.
   */
  exports.CheckboxGroupItem = class CheckboxGroupItem extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$1c]; }
      constructor() {
          super();
          /** Indicates if the group is checked or not. */
          this.checked = false;
          /* Disables the group. */
          this.disabled = false;
          /** The name of the checkbox input */
          this.name = '';
          /** Indicates if the checkbox should be a required field. */
          this.required = false;
          /* The size of the group. */
          this.size = 'md';
          /** The value of the checkbox input */
          this.value = '';
          /** Set a descriptive title for the group. */
          this.title = '';
          this.hasFocus = false;
      }
      blur() {
          this.input.blur();
      }
      click() {
          this.input.click();
      }
      focus(options) {
          this.input.focus(options);
      }
      render() {
          return x `<label class="${classMap({
            'checkbox-group-item': true,
            'checkbox-group-item--checked': this.checked,
            'checkbox-group-item--disabled': this.disabled,
            'checkbox-group-item--focused': this.hasFocus,
            [`checkbox-group-item--${this.size}`]: true,
        })}" part="base"><input aria-checked="${this.checked ? 'true' : 'false'}" class="sr-only" name="${this.name}" title="${this.title}" type="checkbox" value="${l$2(this.value)}" .checked="${l$1(this.checked)}" .disabled="${this.disabled}" .required="${this.required}" @blur="${this.handleBlur}" @click="${this.handleClick}" @focus="${this.handleFocus}" @input="${this.handleInput}"><div class="checkbox-group-item__container"><slot class="checkbox-group-item__leading" name="leading" part="leading"></slot><div class="checkbox-group-item__content"><slot class="checkbox-group-item__text" part="text"></slot><slot class="checkbox-group-item__actions" name="actions" part="actions"></slot></div><k-indicator-icon ?active="${this.checked}" class="checkbox-group-item__indicator-icon" part="indicator-icon" size="md" theme="default"></k-indicator-icon></div><span class="checkbox-group-item__inlay" aria-hidden="true"></span></label>`;
      }
      updated(changedProperties) {
          if (changedProperties.has('checked')) {
              this.handleStateChange();
          }
      }
      handleBlur() {
          this.hasFocus = false;
          const blurEvent = new CustomEvent('k-blur');
          this.dispatchEvent(blurEvent);
      }
      handleClick() {
          this.checked = !this.checked;
          const changeEvent = new CustomEvent('k-change');
          this.dispatchEvent(changeEvent);
      }
      handleFocus() {
          this.hasFocus = true;
          const focusEvent = new CustomEvent('k-focus');
          this.dispatchEvent(focusEvent);
      }
      handleInput() {
          const inputEvent = new CustomEvent('k-input');
          this.dispatchEvent(inputEvent);
      }
      handleStateChange() {
          this.input.checked = this.checked;
      }
  };
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.CheckboxGroupItem.prototype, "checked", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.CheckboxGroupItem.prototype, "disabled", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.CheckboxGroupItem.prototype, "name", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.CheckboxGroupItem.prototype, "required", void 0);
  __decorate([
      n$5({ reflect: true, type: String }),
      __metadata("design:type", String)
  ], exports.CheckboxGroupItem.prototype, "size", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.CheckboxGroupItem.prototype, "value", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.CheckboxGroupItem.prototype, "title", void 0);
  __decorate([
      i$2('input[type="checkbox"]'),
      __metadata("design:type", HTMLInputElement)
  ], exports.CheckboxGroupItem.prototype, "input", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.CheckboxGroupItem.prototype, "hasFocus", void 0);
  exports.CheckboxGroupItem = __decorate([
      customElement('checkbox-group-item'),
      __metadata("design:paramtypes", [])
  ], exports.CheckboxGroupItem);

  var css_248z$1b = i$6`:host([theme=default]){--k-footer-background-color:var(--k-color-white);--k-footer-color:var(--k-color-kong);--k-footer-divider-color:var(--k-color-kong-12)}:host([theme=reversed]){--k-footer-background-color:var(--k-color-gray-900);--k-footer-color:var(--k-color-white);--k-footer-divider-color:var(--k-color-white-12)}:host([theme=transparent]){--k-footer-background-color:transparent;--k-footer-color:var(--k-color-white);--k-footer-divider-color:var(--k-color-white-12)}:host{color:var(--k-footer-color);display:flex}.footer-branding{color:var(--k-footer-color)}.footer-branding__icon{display:block;margin-bottom:var(--k-size-4)}.footer-branding__mission{display:flex;font-size:var(--k-font-size-md);font-weight:var(--k-font-weight-normal);line-height:var(--k-line-height-md);width:100%}@media (min-width:80rem){.footer-branding__mission{max-width:480px}}`;
  var styles$1b = css_248z$1b;
  styleInject(css_248z$1b);

  /**
   * @element k-footer-branding
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FooterBranding = class FooterBranding extends KonstructElement {
      constructor() {
          super(...arguments);
          this.mission = 'Kongregate is an open platform for all web games and a pioneering game developer in the blockchain space.';
          this.theme = 'reversed';
          this.view = 'desktop';
      }
      static { this.styles = [KonstructElement.styles, styles$1b]; }
      get logoTheme() {
          switch (this.theme) {
              case 'default':
                  return 'kong';
              case 'reversed':
              case 'transparent':
              default:
                  return 'default';
          }
      }
      render() {
          return x `<div class="${classMap('footer-branding', `footer-branding--${this.theme}`, `footer-branding--${this.view}`)}" part="base"><k-kong-icon class="footer-branding__icon" theme="${this.logoTheme}" variant="stamp" width="48"></k-kong-icon><slot class="footer-branding__mission">${this.mission}</slot></div>`;
      }
  };
  __decorate([
      n$5({}),
      __metadata("design:type", String)
  ], exports.FooterBranding.prototype, "mission", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FooterBranding.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FooterBranding.prototype, "view", void 0);
  exports.FooterBranding = __decorate([
      customElement('footer-branding')
  ], exports.FooterBranding);

  var css_248z$1a = i$6`:host([theme=default]){--k-footer-background-color:var(--k-color-white);--k-footer-color:var(--k-color-kong);--k-footer-divider-color:var(--k-color-kong-12)}:host([theme=reversed]){--k-footer-background-color:var(--k-color-gray-900);--k-footer-color:var(--k-color-white);--k-footer-divider-color:var(--k-color-white-12)}:host([theme=transparent]){--k-footer-background-color:transparent;--k-footer-color:var(--k-color-white);--k-footer-divider-color:var(--k-color-white-12)}:host{display:flex;width:100%}.footer{background-color:var(--k-footer-background-color);color:var(--k-footer-color);display:block;padding-bottom:var(--k-size-11);padding-top:var(--k-size-11);width:100%}.footer__inner-wrapper{display:flex;flex-direction:column;inline-size:100%;padding-inline:var(--k-size-4)}@media (min-width:64rem){.footer__inner-wrapper{padding-inline:var(--k-size-8)}}.footer__main{border-bottom:1px solid var(--k-footer-divider-color);display:grid;gap:var(--k-size-8);grid-template-columns:repeat(1,minmax(0,1fr));padding-bottom:var(--k-size-8);width:100%}@media (min-width:64rem){.footer__main{grid-template-columns:max-content 1fr}}.footer__content{display:grid;gap:var(--k-size-8);grid-template-columns:repeat(2,minmax(0,1fr))}.footer__content::slotted(k-button){width:100%}@media (min-width:40rem){.footer__content{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (min-width:64rem){.footer__content{grid-template-columns:repeat(4,minmax(0,1fr))}}.footer__content::slotted(div){grid-column:1/-1}@media (min-width:64rem){.footer__content::slotted(div){grid-column:auto}}.footer--mobile .footer__content{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.footer--desktop .footer__content,.footer--tablet .footer__content{font-size:var(--k-font-size-xl);line-height:var(--k-line-height-xl)}.footer__branding{display:flex;width:100%}@media (min-width:40rem){.footer__branding{max-width:480px}}@media (min-width:64rem){.footer__branding{padding-right:32px;width:34vw}}@media (min-width:90rem){.footer__branding{width:39vw}}.footer__meta{align-items:flex-start;display:flex;flex-direction:column;flex-wrap:wrap;gap:var(--k-size-4);justify-content:flex-start;padding-top:var(--k-size-8)}@media (min-width:64rem){.footer__meta{align-items:center;flex-direction:row;justify-content:space-between}}.footer--desktop .footer__meta{padding-top:var(--k-size-8)}.footer__meta__copyright{color:inherit;display:block}.footer__meta__copyright a{color:inherit;text-decoration:none}.footer__meta__copyright a:hover{text-decoration:underline}.footer__meta__legal{display:flex;flex:none}.footer__meta__legal::slotted(*){display:block;flex:none;white-space:nowrap;width:100%}.footer--mobile .footer__meta__legal{width:100%}`;
  var styles$1a = css_248z$1a;
  styleInject(css_248z$1a);

  /**
   * @element k-footer
   *
   * @cssproperty --k-footer-background-color - The background color of the footer.
   * @cssproperty --k-footer-color - The text color of the footer.
   * @cssproperty --k-footer-divider-color - The divider color of the footer.
   */
  exports.Footer = class Footer extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$1a]; }
      constructor() {
          super();
          /**
           * The mission statement to display with the branding.
           */
          this.mission = 'Kongregate is an open platform for all web games and a pioneering game developer in the blockchain space.';
          /**
           * When true, disables the default responsiveness of the component.
           */
          this.static = false;
          /**
           * The theme to display the footer in.
           */
          this.theme = 'reversed';
          /**
           * The view to display the footer in.
           */
          this.view = 'desktop';
          /**
           * Automatically updates the `view` attribute based on
           * device/window size unless the `static` attribute is `true`.
           */
          this.addController(new ResponsiveController(this));
          this.addController(new SlotController(this, {
              forwardAttrs: ['theme', 'view'],
              slots: 'default',
          }));
          this.addController(new SlotController(this, {
              forwardAttrs: ['theme', 'view'],
              slots: ['branding', 'legal', 'meta'],
          }));
      }
      render() {
          return x `<footer class="${classMap('footer', `footer--${this.view}`)}"><div class="footer__inner-wrapper"><main class="footer__main"><slot class="footer__branding" name="branding"><k-footer-branding exportparts="base:branding" mission="${this.mission}" theme="${this.theme}" view="${this.view}"></k-footer-branding></slot><slot class="footer__content"></slot></main><div class="footer__meta"><slot class="footer__meta__copyright" name="copyright"><span>${[
            `Â©ï¸ ${new Date().getFullYear()} Kongregate. An `,
            x `<strong><a href="https://www.mtg.com/" rel="noopener noreferrer" target="_blank">MTG</a></strong>`,
            ' Company.',
        ]}</span></slot><slot class="footer__meta__legal" name="legal"></slot></div></div></footer>`;
      }
  };
  __decorate([
      n$5({
          attribute: 'mission',
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.Footer.prototype, "mission", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Footer.prototype, "static", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Footer.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Footer.prototype, "view", void 0);
  exports.Footer = __decorate([
      customElement('footer'),
      __metadata("design:paramtypes", [])
  ], exports.Footer);

  var css_248z$19 = i$6`:host([theme=default]){--k-footer-background-color:var(--k-color-white);--k-footer-color:var(--k-color-kong);--k-footer-divider-color:var(--k-color-kong-12)}:host([theme=reversed]){--k-footer-background-color:var(--k-color-gray-900);--k-footer-color:var(--k-color-white);--k-footer-divider-color:var(--k-color-white-12)}:host([theme=transparent]){--k-footer-background-color:transparent;--k-footer-color:var(--k-color-white);--k-footer-divider-color:var(--k-color-white-12)}:host{display:flex}.footer-header{align-items:center;color:var(--k-footer-color);display:flex;flex-direction:column;justify-content:center;margin:0 auto}.footer-header--desktop .footer-header,.footer-header--tablet .footer-header{padding-bottom:var(--k-size-16)}.footer-header .footer-header--mobile{padding-bottom:var(--k-size-4)}.footer-header__heading{display:flex;font-size:var(--k-font-size-display-sm);font-weight:var(--k-font-weight-semibold);line-height:var(--k-line-height-display-sm);margin-bottom:0;margin-top:0;text-align:center}.footer-header--desktop .footer-header__heading{margin-bottom:var(--k-size-4);max-width:960px}.footer-header--tablet .footer-header__heading{margin-bottom:var(--k-size-4)}.footer-header--mobile .footer-header__heading{font-size:var(--k-font-size-display-xs);line-height:1.25;margin-bottom:var(--k-size-2)}.footer-header__subheading{display:flex;font-size:var(--k-font-size-xl);line-height:var(--k-line-height-xl);text-align:center}.footer-header--desktop .footer-header__subheading{max-width:960px}.footer-header--mobile .footer-header__subheading{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}`;
  var styles$19 = css_248z$19;
  styleInject(css_248z$19);

  /**
   * @element k-footer-header
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FooterHeader = class FooterHeader extends KonstructElement {
      constructor() {
          super(...arguments);
          this.heading = '';
          this.subheading = '';
          this.theme = 'reversed';
          this.view = 'desktop';
      }
      static { this.styles = [KonstructElement.styles, styles$19]; }
      render() {
          return x `<header class="${classMap('footer-header', `footer-header--${this.theme}`, `footer-header--${this.view}`)}" part="base"><slot class="footer-header__heading" name="heading">${this.heading}</slot><slot class="footer-header__subheading" name="subheading">${this.subheading}</slot><slot name="actions"></slot></header>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.FooterHeader.prototype, "heading", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.FooterHeader.prototype, "subheading", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FooterHeader.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FooterHeader.prototype, "view", void 0);
  exports.FooterHeader = __decorate([
      customElement('footer-header')
  ], exports.FooterHeader);

  var css_248z$18 = i$6`:host([theme=default]){--k-footer-links-color:var(--k-color-kong)}:host([theme=reversed]){--k-footer-links-color:var(--k-color-white)}:host([theme=transparent]){--k-footer-links-color:var(--k-color-white)}.footer-links{color:var(--k-footer-links-color);display:flex;font-size:var(--k-font-size-md);font-weight:var(--k-font-weight-medium);gap:1rem;line-height:var(--k-line-height-md)}.footer-links__heading{align-items:center;display:flex;margin:0;position:relative}.footer-links__heading:before{background:var(--k-footer-links-color);block-size:10px;border-radius:50%;content:"";display:inline-block;inline-size:10px;inset-block-start:5px;inset-inline-start:0;margin-inline-end:5px}.footer-links__links{align-items:flex-start;display:flex;gap:12px;padding-block:0;padding-inline:0}.footer-links--column{align-items:flex-start;flex-direction:column;inline-size:150px}.footer-links--column .footer-links__links{flex-direction:column}.footer-links--row{align-items:center;flex-direction:row}.footer-links--row .footer-links__links{flex-direction:row}.footer-links slot,.footer-links slot a,.footer-links slot::slotted(a){color:inherit;font-weight:var(--k-font-weight-medium);text-decoration:none}.footer-links slot a:hover,.footer-links slot::slotted(a:hover){text-decoration:underline!important}`;
  var styles$18 = css_248z$18;
  styleInject(css_248z$18);

  /**
   * A Footer Link Column contains a grouping of footer link, with a
   * title heading at the top.
   *
   * @element k-footer-links
   *
   * @slot - The collection of links.
   * @slot heading - A title heading that appears at the top of the column.
   *
   * @csspart base - The base element container.
   */
  exports.FooterLinks = class FooterLinks extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$18]; }
      constructor() {
          super();
          this.direction = 'column';
          this.theme = 'reversed';
          /** Controls the slotted content of the default slot. */
          this.slotController = new SlotController(this, {
              /** Filter slotted elements to only `FooterLink`s. */
              allow: [HTMLAnchorElement, HTMLSpanElement],
              /** Forward the `theme` attribute to all slotted elements. */
              slots: 'default',
          });
          this.addController(this.slotController);
      }
      render() {
          return x `<div class="${classMap('footer-links', {
            'footer-links--column': this.direction === 'column',
            'footer-links--row': this.direction === 'row',
        })}" part="base"><slot name="heading">${n$2(this.heading, () => x `<k-text class="footer-links__heading" semibold sm tag="div">${this.heading}</k-text>`)}</slot><slot class="footer-links__links"></slot></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FooterLinks.prototype, "direction", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FooterLinks.prototype, "heading", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.FooterLinks.prototype, "theme", void 0);
  exports.FooterLinks = __decorate([
      customElement('footer-links'),
      __metadata("design:paramtypes", [])
  ], exports.FooterLinks);

  const nextDate = (date, days = 1) => new Date(date.getTime() + days * 86400000);
  const nextDay = (date, format = 'long', locale = 'en-US') => Intl.DateTimeFormat(locale, { weekday: format }).format(nextDate(date, 1));
  const previousDate = (date, days = 1) => new Date(date.getTime() - days * 86400000);
  const isSameYear = (date1, date2) => date1.getFullYear() === date2.getFullYear();
  const isSameMonth = (date1, date2) => isSameYear(date1, date2) && date1.getMonth() === date2.getMonth();
  const isSameDate = (date1, date2) => isSameMonth(date1, date2) && date1.getDate() === date2.getDate();

  const K_SELECT_CHALLENGE = 'k-select-challenge';

  const K_SELECT_WEEKDAY = 'k-select-weekday';

  var css_248z$17 = i$6`:host{display:flex}.challenge-badge{background-color:var(--k-color-gray-800);border:none;border-radius:var(--k-size-6);box-shadow:var(--k-shadow-lg);color:var(--k-color-white);cursor:pointer;display:flex;font-size:var(--k-font-size-sm);gap:var(--k-size-3);line-height:var(--k-line-height-sm);max-width:100%;min-width:480px;padding:var(--k-size-3);text-align:left;text-decoration:none;transition-duration:var(--k-transition-medium);transition-property:color;width:100%}.challenge-badge--focused{box-shadow:var(--k-focus-ring-kong-4);outline:0}.challenge-badge__image{background-color:var(--k-color-gray-800);border-radius:var(--k-size-3);display:block;height:80px;width:80px}.challenge-badge__image img{height:auto;width:100%}.challenge-badge--completed{background-color:var(--k-color-white);color:var(--k-color-gray-900)}.challenge-badge--mobile{width:320px}.challenge-badge__content{display:flex;flex:1;flex-direction:column;gap:var(--k-size-1)}.challenge-badge__content slot{display:block}.challenge-badge__header{font-weight:var(--k-font-weight-bold)}.challenge-badge__action{flex-direction:column;height:100%}.challenge-badge__action,.challenge-badge__action-button{align-items:center;display:flex;justify-content:center;width:var(--k-size-12)}.challenge-badge__action-button{background:var(--k-color-gray-50);border-radius:50%;color:var(--k-color-kong);height:var(--k-size-12);transition-duration:var(--k-transition-medium);transition-property:color}.challenge-badge--hovered .challenge-badge__action-button{background:var(--k-color-kong);color:var(--k-color-white)}`;
  var styles$17 = css_248z$17;
  styleInject(css_248z$17);

  /**
   * @element k-challenge-badge
   *
   * @csspart base - The component's base wrapper.
   */
  exports.ChallengeBadge = class ChallengeBadge extends KonstructElement {
      constructor() {
          super(...arguments);
          this.badge = '';
          this.completed = false;
          this.game = '';
          this.slug = '';
          this.view = 'desktop';
          this.ref = e$1();
          this.hoverController = new HoverController(this, this.ref);
          this.focusController = new FocusController(this, this.ref);
          this.badgeImage = new ImageController(this, {
              alt: this.alt ?? this.game,
              fallback: `${KONSTRUCT_ASSETS_PATH}/ui/headers/challenge-badge/fallback.gif`,
              src: this.completed
                  ? `${KONSTRUCT_ASSETS_PATH}/ui/headers/challenge-badge/completed.gif`
                  : this.badge,
          });
          this.completedImage = new ImageController(this, {
              alt: this.alt ?? this.game,
              fallback: `${KONSTRUCT_ASSETS_PATH}/ui/headers/challenge-badge/fallback.gif`,
              src: `${KONSTRUCT_ASSETS_PATH}/ui/headers/challenge-badge/completed.gif`,
          });
          this.playIcon = new SVGController(this, `${KONSTRUCT_ASSETS_PATH}/ui/headers/challenge-badge/play.svg`, {
              mutator: (svg) => {
                  svg.setAttribute('alt', this.completed ? 'Share' : 'Play');
                  svg.querySelectorAll('path').forEach((path) => {
                      path.setAttribute('fill', 'currentColor');
                  });
              },
          });
          this.shareIcon = new SVGController(this, `${KONSTRUCT_ASSETS_PATH}/ui/headers/challenge-badge/share.svg`, {
              mutator: (svg) => {
                  svg.setAttribute('alt', this.completed ? 'Share' : 'Play');
                  svg.querySelectorAll('path').forEach((path) => {
                      path.setAttribute('fill', 'currentColor');
                  });
              },
          });
      }
      static { this.styles = [KonstructElement.styles, styles$17]; }
      get content() {
          if (!this.completed) {
              let content = [
                  'Get a head start.',
                  x `Â `,
                  x `<strong>Play Now!</strong>`,
              ];
              if (this.game) {
                  content = [
                      'The Badge of the Day will be in',
                      x `Â `,
                      x `<strong>${this.game}.</strong>`,
                      x `Â `,
                      ...content,
                  ];
              }
              return content;
          }
          return [
              x `<div>You completed the Badge of the Day.</div>`,
              `Check back again ${this.date ? nextDay(this.date) : 'tomorrow'}!`,
              x `Â `,
              x `<strong>Share This</strong>`,
          ];
      }
      render() {
          return x `<button @click="${this.handleSelectChallenge}" @keydown="${this.handleSelectChallenge}" class="${classMap('challenge-badge', `challenge-badge--${this.view}`, {
            'challenge-badge--completed': this.completed,
            'challenge-badge--focused': this.focusController.focused,
            'challenge-badge--hovered': this.hoverController.hovered,
        })}" part="base" ${n$3(this.ref)}><slot class="challenge-badge__image" name="image">${n$2(this.completed, () => this.completedImage.render(), () => this.badgeImage.render())}</slot><div class="challenge-badge__content"><slot class="challenge-badge__header" name="header">${n$2(this.completed, () => 'Time to celebrate!', () => "Today's Badge")}</slot><slot>${this.content}</slot></div><slot class="challenge-badge__action" name="action"><span class="challenge-badge__action-button">${n$2(this.completed, () => this.shareIcon.render(), () => this.playIcon.render())}</span></slot></button>`;
      }
      handleSelectChallenge(e) {
          const action = 'keyCode' in e ? 'click' : 'keydown';
          const event = new CustomEvent(K_SELECT_CHALLENGE, {
              bubbles: true,
              composed: true,
              detail: {
                  action,
                  game: this.game,
                  id: this.componentId,
                  slug: this.slug,
              },
          });
          this.dispatchEvent(event);
      }
  };
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", String)
  ], exports.ChallengeBadge.prototype, "alt", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ChallengeBadge.prototype, "badge", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeBadge.prototype, "completed", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Date,
      }),
      __metadata("design:type", Date)
  ], exports.ChallengeBadge.prototype, "date", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeBadge.prototype, "game", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeBadge.prototype, "slug", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ChallengeBadge.prototype, "view", void 0);
  exports.ChallengeBadge = __decorate([
      customElement('challenge-badge')
  ], exports.ChallengeBadge);

  class KongpanionController {
      static { this.API_URL = '//api.kongregate.com/api/kongpanions/index.json'; }
      constructor(host, name) {
          this._host = host;
          this._name = name;
          this._json = new JSONController(this._host, {
              skip: !this._name(),
              src: KongpanionController.API_URL,
          });
      }
      get name() {
          return this._name();
      }
      set name(name) {
          this._name = name;
          this._host.requestUpdate();
      }
      render(renderFns) {
          return this._json.render({
              ...renderFns,
              complete: (json) => {
                  const kongpanion = this.transformer(json);
                  return renderFns.complete?.(kongpanion);
              },
          });
      }
      transformer(json) {
          if (json === null) {
              return null;
          }
          if (!('kongpanions' in json) || !Array.isArray(json.kongpanions)) {
              throw new Error('Invalid response.');
          }
          const kongpanion = json.kongpanions.find(({ name = '' }) => name.toLowerCase() === this.name.toLowerCase());
          if (!kongpanion) {
              throw new Error(`Could not find kongpanion with name "${this._kongpanion}".`);
          }
          return {
              description: kongpanion.description ?? '',
              id: kongpanion.id ?? '',
              name: kongpanion.name ?? this.name,
              shinySrc: kongpanion.shiny_icon_url ?? '',
              src: kongpanion.normal_icon_url ?? '',
          };
      }
  }

  var css_248z$16 = i$6`:host{display:flex}@keyframes float{0%{transform:translatey(0)}50%{transform:translatey(-20px)}to{transform:translatey(0)}}@keyframes shadow{0%{width:75%}50%{width:100%}to{width:75%}}.kongpanion{align-items:center;display:flex;flex-direction:column;justify-content:space-between;position:relative;width:220px;z-index:var(--k-z-index-20)}.kongpanion img{height:auto;max-width:170px;z-index:var(--k-z-index-20)}.kongpanion--animated .kongpanion__image{animation:float 6s ease-in-out infinite;transform:translatey(0)}.kongpanion--animated .kongpanion__shadow{animation:shadow 6s ease-in-out infinite;width:80%}.kongpanion__shiny-background{bottom:0;display:inline-flex;left:0;position:absolute;right:0;top:0;z-index:var(--k-z-index-10)}`;
  var styles$16 = css_248z$16;
  styleInject(css_248z$16);

  /**
   * @element k-kongpanion
   *
   * @csspart base - The component's base wrapper.
   */
  exports.Kongpanion = class Kongpanion extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether to animate the kongpanion image. */
          this.animated = false;
          /** The name of the kongpanion. */
          this.kongpanion = '';
          /** Whether to display the component in a shiny state. */
          this.shiny = false;
          this.ready = false;
          this._kongpanion = new KongpanionController(this, () => this.kongpanion);
          this._shadow = new SVGController(this, `${KONSTRUCT_ASSETS_PATH}/ui/kongpanion/shadow.svg`, {
              mutator: (svg) => {
                  svg.setAttribute('class', 'kongpanion__shadow');
              },
          });
          this._shinyBackground = new ImageController(this, {
              alt: 'Shiny background',
              src: `${KONSTRUCT_ASSETS_PATH}/ui/kongpanion/shiny.gif`,
          });
      }
      static { this.API_URL = '//api.kongregate.com/api/kongpanions/index.json'; }
      static { this.styles = [KonstructElement.styles, styles$16]; }
      render() {
          return x `<div class="${classMap('kongpanion', {
            'kongpanion--animated': this.animated,
        })}" part="base">${this._kongpanion.render({
            complete: (kongpanion) => this.renderKongpanion(kongpanion),
        })} ${n$2(this.ready && this.shiny, () => x `<div class="kongpanion__shiny-background">${this._shinyBackground.render()}</div>`)} ${n$2(this.ready, () => this._shadow.render())}</div>`;
      }
      renderKongpanion(kongpanion) {
          if (!kongpanion && !this.src) {
              return A;
          }
          /**
           * When a `kongpanion` name is provided, use either the regular
           * or shiny src from the api. Otherwise, use the `src` provided.
           */
          const src = kongpanion
              ? this.shiny
                  ? kongpanion.shinySrc
                  : kongpanion.src
              : this.src;
          return x `<img alt="${this.alt ?? kongpanion?.name ?? 'Kongpanion'}" class="kongpanion__image" @error="${() => {
            this.ready = false;
        }}" @load="${() => {
            this.ready = true;
        }}" src="${src}">`;
      }
  };
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Kongpanion.prototype, "alt", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Kongpanion.prototype, "animated", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.Kongpanion.prototype, "kongpanion", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Kongpanion.prototype, "shiny", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Kongpanion.prototype, "src", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.Kongpanion.prototype, "ready", void 0);
  exports.Kongpanion = __decorate([
      customElement('kongpanion')
  ], exports.Kongpanion);

  var css_248z$15 = i$6`:host{display:flex;width:100%}.weekday{align-items:center;cursor:pointer;display:flex;height:62px;justify-content:center;min-width:80px;padding:7px 6px;position:relative;width:100%}.weekday--mobile{min-width:62px}.weekday__background{background-color:transparent;border-radius:4px;right:0;z-index:var(--k-z-index-10)}.weekday__background,.weekday__border{bottom:0;left:0;position:absolute;top:0}.weekday__border{background-color:var(--k-color-black-6);width:1px;z-index:var(--k-z-index-20)}.weekday__container{align-items:center;border-radius:var(--k-size-2);display:flex;flex-direction:column;height:50px;justify-content:flex-start;position:relative;width:50px;z-index:var(--k-z-index-50)}.weekday--hovered .weekday__container{background-color:var(--k-color-gray-base-200)}.weekday--today .weekday__background{background-color:var(--k-color-gray-50);z-index:var(--k-z-index-40)}.weekday--today .weekday__border{background-image:var(--k-gradient-kong-45);border-radius:var(--k-size-2);bottom:-6px;left:-6px;right:-6px;top:-6px;width:unset;z-index:var(--k-z-index-30)}.weekday--shiny .weekday__background{background-color:var(--k-color-yellow-50)}.weekday--shiny .weekday__border,.weekday--shiny.weekday--hovered .weekday__container{background-color:var(--k-color-yellow-300)}.weekday.weekday--shiny.weekday--today{background-color:var(--k-color-yellow-50)!important}.weekday.weekday--hovered.weekday--shiny .weekday__container{background-color:var(--k-color-yellow-300)}.weekday__date,.weekday__day{display:block;pointer-events:none}.weekday__day{color:var(--k-color-gray-500);font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-semibold);line-height:var(--k-line-height-sm);line-height:22px;text-transform:uppercase}.weekday--sun .weekday__day{color:var(--k-color-kong)}.weekday__date{color:var(--k-color-gray-900);font-size:var(--k-font-size-display-xs);font-weight:var(--k-font-weight-medium);line-height:var(--k-line-height-display-xs);line-height:32px}.weekday--today{background-color:var(--k-color-gray-50);border-left-color:transparent;border-radius:var(--k-size-1);position:relative}.weekday--today:before{background-color:none;background-image:var(--k-gradient-kong-45);border-radius:var(--k-size-2);bottom:-6px;left:-6px;right:-6px;top:-6px;width:unset}.weekday--today--hovered:before{bottom:-8px;left:-8px;right:-8px;top:-8px}.weekday--today--shiny{background-color:var(--k-color-yellow-300)}`;
  var styles$15 = css_248z$15;
  styleInject(css_248z$15);

  /**
   * A calendar day used for displaying a daily challenge.
   *
   * @element k-challenge-weekday
   *
   * @csspart base - The component's base wrapper.
   * @csspart day - The textual abbreviation for the day (i.e: Wed);
   * @csspart date - The numerical date for the day.
   
   * @event k-click-weekday - Dispatched with the weekday's date when it is clicked.
   */
  exports.ChallengeWeekday = class ChallengeWeekday extends KonstructElement {
      constructor() {
          super(...arguments);
          /**
           * Whether the challenge for the given day has been completed.
           */
          this.completed = false;
          /**
           * The date for the weekday. When provided as an attribute, any
           * string parseable by the Date constructor is valid.
           */
          this.date = new Date();
          /**
           * The locale to use when formatting the weekday's text.
           */
          this.locale = window.navigator.language;
          /**
           * Whether to display the weekday as "shiny".
           */
          this.shiny = false;
          /**
           * Whether to highlight the weekday as being "today".
           */
          this.today = false;
          /**
           * The screen view to display the weekday in.
           */
          this.view = 'desktop';
          this.ref = e$1();
          this.hoverController = new HoverController(this, this.ref);
      }
      static { this.styles = [KonstructElement.styles, styles$15]; }
      get weekday() {
          return new Intl.DateTimeFormat(this.locale, { weekday: 'short' }).format(this.date);
      }
      get formattedDate() {
          return this.date.getDate().toString().padStart(2, '0');
      }
      render() {
          return x `<div @click="${this.handleSelectWeekday}" @keydown="${this.handleSelectWeekday}" class="${classMap('weekday', `weekday--${this.view}`, `weekday--${this.weekday.toLowerCase()}`, {
            'weekday--completed': this.completed,
            'weekday--hovered': this.hoverController.hovered,
            'weekday--shiny': this.shiny,
            'weekday--today': this.today,
        })}" part="base" role="button" ${n$3(this.ref)}><div class="weekday__background"></div><div class="weekday__border"></div><div class="weekday__container"><div class="weekday__day" part="day">${this.weekday}</div><div class="weekday__date" part="date">${n$2(this.completed, 
        // @todo move this to an icon
        () => x `<svg width="24" height="22" viewBox="0 0 24 22"><path d="M0.842023 13.4008L5.24971 20.4111C6.10406 21.7615 8.00693 21.8807 8.9972 20.6295L23.5212 2.65689C24.5503 1.38589 22.8028 -0.262425 21.6377 0.889413L7.48267 14.8902L3.96818 10.9581C2.33714 9.13101 -0.478339 11.3354 0.842023 13.4206V13.4008Z" fill="#F04438"/></svg>`, () => this.formattedDate)}</div></div></div>`;
      }
      handleSelectWeekday(e) {
          const action = 'keyCode' in e ? 'click' : 'keydown';
          const event = new CustomEvent(K_SELECT_WEEKDAY, {
              bubbles: false,
              composed: true,
              detail: {
                  action,
                  date: this.date,
                  id: this.componentId,
              },
          });
          this.dispatchEvent(event);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeWeekday.prototype, "completed", void 0);
  __decorate([
      n$5({
          converter: dateConverter,
          reflect: true,
          type: Date,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeWeekday.prototype, "date", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ChallengeWeekday.prototype, "locale", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeWeekday.prototype, "shiny", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeWeekday.prototype, "today", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ChallengeWeekday.prototype, "view", void 0);
  exports.ChallengeWeekday = __decorate([
      customElement('challenge-weekday')
  ], exports.ChallengeWeekday);

  var css_248z$14 = i$6`:host{display:flex;width:100%}.challenge-week{display:flex;position:relative;width:100%}.challenge-week:before{background:0 0;bottom:0;content:"";display:block;left:0;position:absolute;right:0;top:0}.challenge-week--shiny:before{background-color:var(--k-color-yellow-50)}`;
  var styles$14 = css_248z$14;
  styleInject(css_248z$14);

  /**
   * @element k-challenge-week
   *
   * @csspart base - The component's base wrapper.
   */
  exports.ChallengeWeek = class ChallengeWeek extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$14]; }
      constructor() {
          super();
          /**
           * An array of dates for challenges that have been completed. When
           * provided as an attribute, any string parseable by the Date
           * constructor is considered a valid date. Single values can be
           * provided as a string, i.e: "12/31/20", multiple values as
           * a stringified array, i.e: "[12/31/20, 01/01/21]".
           */
          this.completed = [];
          /**
           * The date to center the week around, i.e: "today".
           */
          this.date = new Date();
          /**
           * The locale to use when formatting the weekday's text.
           */
          this.locale = window.navigator.language;
          /**
           * Whether to display the weekday as "shiny".
           */
          this.shiny = false;
          /**
           * The screen view to display the weekday in.
           */
          this.view = 'desktop';
          this.addController(new SlotController(this, {
              allow: [exports.ChallengeWeekday],
              forwardAttrs: ['locale', 'shiny', 'view'],
              slots: 'default',
          }));
      }
      get perMonth() {
          return new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
      }
      get dateOffset() {
          const day = this.date.getDay();
          // Monday
          if (day === 1) {
              return 0;
          }
          // Sunday
          if (day === 0) {
              return 6;
          }
          // Other days
          return day - 1;
      }
      render() {
          return x `<div class="${classMap('challenge-week', {
            'challenge-week--shiny': this.shiny,
        })}" part="base"><slot>${this.renderDates()}</slot></div>`;
      }
      renderDates() {
          return [0, 1, 2, 3, 4, 5, 6].map((index) => {
              const date = previousDate(this.date, this.dateOffset - index);
              const isCompleted = !!this.completed.find((completedDate) => completedDate.getDate() === date.getDate());
              const isToday = date.getDate() === this.date.getDate();
              return x `<k-challenge-weekday ?completed="${isCompleted}" ?shiny="${this.shiny}" ?today="${isToday}" date="${date}" locale="${this.locale}" view="${this.view}"></k-challenge-weekday>`;
          });
      }
  };
  __decorate([
      n$5({
          converter: dateArrayConverter,
          reflect: true,
          type: Array,
      }),
      __metadata("design:type", Array)
  ], exports.ChallengeWeek.prototype, "completed", void 0);
  __decorate([
      n$5({
          converter: dateConverter,
          reflect: true,
          type: Date,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeWeek.prototype, "date", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ChallengeWeek.prototype, "locale", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeWeek.prototype, "shiny", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ChallengeWeek.prototype, "view", void 0);
  exports.ChallengeWeek = __decorate([
      customElement('challenge-week'),
      __metadata("design:paramtypes", [])
  ], exports.ChallengeWeek);

  var css_248z$13 = i$6`:host{display:flex}.challenge-header{width:100%}.challenge-header__container{position:relative}.challenge-header__row{display:flex;gap:var(--k-size-8);padding-left:220px;position:relative}.challenge-header__row:not(:last-child){margin-bottom:var(--k-size-10)}.challenge-header__kongpanion{align-items:center;bottom:0;display:flex;justify-content:center;left:0;padding-bottom:25px;position:absolute;top:0}.challenge-header__nav{align-items:center;display:flex;justify-content:space-between}.challenge-header__nav slot{display:block}.challenge-header__nav slot a,.challenge-header__nav slot::slotted(a){color:inherit;font-weight:var(--k-font-weight-semibold);text-decoration:none}.challenge-header__badge{display:block;flex:1;min-width:560px;width:100%}.challenge-header__info{align-items:center;background-color:var(--k-color-gray-50);display:flex;min-height:68px;position:relative}.challenge-header--shiny .challenge-header__info{background-color:var(--k-color-yellow-50)}.challenge-header__info__message{display:block;flex:1;font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm);max-width:460px;padding-bottom:var(--k-size-4);padding-top:var(--k-size-4)}.challenge-header__info__week{display:flex;flex:1;min-width:560px}.challenge-header__content{display:block;flex:1;max-width:460px;padding-top:var(--k-size-6)}.challenge-header__heading,.challenge-header__heading>*{display:block;font-size:var(--k-font-size-display-xs);font-weight:var(--k-font-weight-bold);line-height:var(--k-line-height-display-xs);margin-bottom:var(--k-size-1-5)}.challenge-header__subheading,.challenge-header__subheading>*{display:block;font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm);max-width:428px}`;
  var styles$13 = css_248z$13;
  styleInject(css_248z$13);

  /**
   * @element k-challenge-header
   *
   * @csspart base - The component's base wrapper.
   * @csspart week - The challenge-week component.
   *
   * @slot badge      - The slot containing the `challenge-badge` component.
   * @slot heading    - The heading slot. Can be used instead of the `heading`
   *                    attribute to provide more control.
   * @slot kongpanion - The slot containing the `kongpanion` component.
   * @slot message    - The message slot. Can be used instead of the `message`
   *                    attribute to provide more control.
   * @slot navigation - The navigation slot, meant for including links.
   * @slot subheading - The subheading slot. Can be used instead of the `subheading`
   *                    attribute to provide more control.
   * @slot week       - The slot containing the `challenge-week` component.
   */
  exports.ChallengeHeader = class ChallengeHeader extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$13]; }
      constructor() {
          super();
          /**
           * An array of dates for challenges that have been completed. When
           * provided as an attribute, any string parseable by the Date
           * constructor is considered a valid date. Single values can be
           * provided as a string, i.e: "12/31/20", multiple values as
           * a stringified array, i.e: "[12/31/20, 01/01/21]".
           */
          this.completed = [];
          /**
           * The date to center the week around, i.e: "today".
           */
          this.date = new Date();
          /**
           * The heading text to display. Can also be provided using
           * the "heading" slot.
           */
          this.heading = '';
          /**
           * The locale to use when formatting the challenge-header's text.
           */
          this.locale = window.navigator.language;
          /**
           * The message text to display for the badge. Can also be
           * provided using the "message" slot.
           */
          this.message = '';
          /**
           * Whether to display the challenge-header as "shiny".
           */
          this.shiny = false;
          /**
           * The subheading text to display. Can also be provided using
           * the "subheading" slot.
           */
          this.subheading = '';
          this.title = '';
          /**
           * The screen view to display the challenge-header in.
           */
          this.view = 'desktop';
          /** "challenge" slot controller */
          this.addController(new SlotController(this, {
              allow: [exports.ChallengeBadge],
              forwardAttrs: ['shiny', 'view'],
              setAttrs: () => {
                  if (
                  /**
                   * If the date is in the completed array, set the
                   * "completed" attribute on the k-challenge-badge to true.
                   */
                  this.isCompleted) {
                      return { completed: true };
                  }
                  return {};
              },
              slots: ['badge'],
          }));
          /** "week" slot controller */
          this.addController(new SlotController(this, {
              allow: [exports.ChallengeWeek],
              forwardAttrs: ['completed', 'date', 'shiny', 'view'],
              slots: ['week'],
          }));
          this.addController(new SlotController(this, {
              allow: [exports.Kongpanion],
              limit: 1,
              setAttrs: () => ({ shiny: this.shiny }),
              slots: ['kongpanion'],
          }));
      }
      get isCompleted() {
          return this.completed.find((date) => isSameDate(date, this.date));
      }
      render() {
          return x `<header class="${classMap('challenge-header', `challenge-header--${this.view}`, {
            'challenge-header--shiny': this.shiny,
        })}" part="base"><div class="challenge-header__container"><slot class="challenge-header__kongpanion" name="kongpanion"></slot><div class="challenge-header__row">${[this.renderHeadings(), this.renderBadge()]}</div><div class="${classMap('challenge-header__row', 'challenge-header__info')}"><slot class="challenge-header__info__message" name="message">${this.message}</slot><slot class="challenge-header__info__week" name="week"><k-challenge-week ?shiny="${this.shiny}" .completed="${this.completed}" .date="${this.date}" exportparts="base:week" locale="${this.locale}" view="${this.view}"></k-challenge-week></slot></div></div></header>`;
      }
      renderBadge() {
          return x `<slot class="challenge-header__badge" name="badge"></slot>`;
      }
      renderHeadings() {
          return x `<div class="challenge-header__content"><slot class="challenge-header__heading" name="heading">${this.heading}</slot><slot class="challenge-header__subheading" name="subheading">${this.subheading}</slot></div>`;
      }
  };
  __decorate([
      n$5({
          converter: dateArrayConverter,
          reflect: true,
          type: Array,
      }),
      __metadata("design:type", Array)
  ], exports.ChallengeHeader.prototype, "completed", void 0);
  __decorate([
      n$5({
          converter: dateConverter,
          reflect: true,
          type: Date,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeHeader.prototype, "date", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeHeader.prototype, "heading", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ChallengeHeader.prototype, "locale", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeHeader.prototype, "message", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeHeader.prototype, "shiny", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeHeader.prototype, "subheading", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.ChallengeHeader.prototype, "title", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ChallengeHeader.prototype, "view", void 0);
  exports.ChallengeHeader = __decorate([
      customElement('challenge-header'),
      __metadata("design:paramtypes", [])
  ], exports.ChallengeHeader);

  var css_248z$12 = i$6`.text{color:inherit;margin:0}.text--xs{font-size:var(--k-font-size-xs);line-height:var(--k-line-height-xs)}.text--xs.text--display{font-size:var(--k-font-size-display-xs);line-height:var(--k-line-height-display-xs)}.text--sm{font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}.text--sm.text--display{font-size:var(--k-font-size-display-sm);line-height:var(--k-line-height-display-sm)}.text--md{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.text--md.text--display{font-size:var(--k-font-size-display-md);letter-spacing:.02em;line-height:var(--k-line-height-display-md)}.text--lg{font-size:var(--k-font-size-lg);line-height:var(--k-line-height-lg)}.text--lg.text--display{font-size:var(--k-font-size-display-lg);letter-spacing:.02em;line-height:var(--k-line-height-display-lg)}.text--xl{font-size:var(--k-font-size-xl);line-height:var(--k-line-height-xl)}.text--xl.text--display{font-size:var(--k-font-size-display-xl);letter-spacing:.02em;line-height:var(--k-line-height-display-xl)}.text--xxl.text--display{font-size:var(--k-font-size-display-xxl);letter-spacing:.02em;line-height:var(--k-line-height-display-xxl)}.text--light{font-weight:var(--k-font-weight-light)}.text--normal{font-weight:var(--k-font-weight-normal)}.text--medium{font-weight:var(--k-font-weight-medium)}.text--semibold{font-weight:var(--k-font-weight-semibold)}.text--bold{font-weight:var(--k-font-weight-bold)}`;
  var styles$12 = css_248z$12;
  styleInject(css_248z$12);

  /**
   * Display text with design system theming.
   *
   * @element k-text
   *
   * @csspart base - The base element container.
   */
  exports.Text = class Text extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Indicates if the text is for headline display purposes or for copy. */
          this.display = false;
          /* Extra small text. */
          this.xs = false;
          /* Small text. */
          this.sm = false;
          /* Medium text. */
          this.md = false;
          /* Large text. */
          this.lg = false;
          /* Extra large text. */
          this.xl = false;
          /* 2x large text. */
          this.xxl = false;
          /* Light font weight text. */
          this.light = false;
          /* Normal font weight text. */
          this.normal = false;
          /* Regular font weight text. A mirror of `normal` style. */
          this.regular = false;
          /* Medium font weight text. */
          this.medium = false;
          /* Semibold font weight text. */
          this.semibold = false;
          /* Bold font weight text. */
          this.bold = false;
          /* The HTML tag to use for the text. */
          this.tag = 'span';
      }
      static { this.styles = [KonstructElement.styles, styles$12]; }
      get elementTag() {
          return o(this.tag);
      }
      render() {
          return n `
      <${this.elementTag}
        class=${classMap('text', {
            'text--bold': this.bold,
            'text--display': this.display,
            'text--lg': this.lg,
            'text--light': this.light,
            'text--md': this.md,
            'text--medium': this.medium,
            'text--normal': this.normal || this.regular,
            'text--semibold': this.semibold,
            'text--sm': this.sm,
            'text--xl': this.xl,
            'text--xs': this.xs,
            'text--xxl': this.xxl,
        })}
        part="base"
      >
        <slot></slot>
      </${this.elementTag}>
    `;
      }
  };
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "display", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "xs", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "sm", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "md", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "lg", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "xl", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "xxl", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "light", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "normal", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "regular", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "medium", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "semibold", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "bold", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", Object)
  ], exports.Text.prototype, "tag", void 0);
  exports.Text = __decorate([
      customElement('text')
  ], exports.Text);

  var css_248z$11 = i$6`:host{--theme-effect:inherit;display:inline}.text-effect{-webkit-text-fill-color:transparent;text-fill-color:transparent;background-clip:text;-webkit-background-clip:text;background-image:var(--theme-effect,var(--effect));display:inline}.text-effect--kong-45{--effect:var(--k-gradient-kong-45)}.text-effect--kong-fade{--effect:var(--k-gradient-kong-fade)}.text-effect--kong-glow{--effect:var(--k-gradient-kong-glow)}.text-effect--developer-45{--effect:var(--k-gradient-developer-45)}.text-effect--unset{-webkit-text-fill-color:currentcolor;text-fill-color:currentcolor;-webkit-background-clip:none;background-clip:none;background-image:none;color:var(--k-color-white)}`;
  var styles$11 = css_248z$11;
  styleInject(css_248z$11);

  /**
   * @element k-text-effect
   *
   * @summary - A text effect applies fx styles to typography elements.
   *
   * @csspart base - The base element container.
   *
   * @cssproperty --effect - The effect to apply.
   */
  exports.TextEffect = class TextEffect extends KonstructElement {
      constructor() {
          super(...arguments);
          /* The text effect to apply. */
          this.effect = 'kong-45';
          /** Unset the effect, in order to display originally styled text. */
          this.unset = false;
      }
      static { this.styles = [KonstructElement.styles, styles$11]; }
      render() {
          return x `<slot class="${classMap('text-effect', `text-effect--${this.effect}`, {
            'text-effect--unset': this.unset,
        })}" part="base"></slot>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.TextEffect.prototype, "effect", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.TextEffect.prototype, "unset", void 0);
  exports.TextEffect = __decorate([
      customElement('text-effect')
  ], exports.TextEffect);

  var css_248z$10 = i$6`:host{color:currentColor}.section-header{align-items:center;display:flex;flex-direction:column;justify-content:center;text-align:center;transition:all .15s ease-in-out;width:100%}.section-header slot{color:currentColor;display:block;margin-left:auto;margin-right:auto;max-width:924px}.section-header slot::slotted(*),.section-header slot>*{text-align:center}.section-header__content{font-size:var(--k-font-size-xl);line-height:var(--k-line-height-xl);margin-top:var(--k-size-2)}:host([mobile]) .section-header__content{font-size:var(--k-font-size-lg);line-height:var(--k-line-height-lg);margin-bottom:var(--k-size-2)}.section-header__heading{font-size:var(--k-font-size-display-lg);font-weight:var(--k-font-weight-semibold);line-height:var(--k-line-height-display-lg);margin-bottom:var(--k-size-4)}:host([mobile]) .section-header__heading{font-size:var(--k-font-size-display-md);line-height:var(--k-line-height-display-md)}`;
  var styles$10 = css_248z$10;
  styleInject(css_248z$10);

  /**
   * A page header component.
   *
   * @element k-section-header
   *
   * @slot - The content to display in the page header.
   * @slot actions - The actions to display in the page header.
   * @slot heading - The heading to display in the page header.
   *
   * @csspart base - The base element container.
   */
  exports.SectionHeader = class SectionHeader extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The content to display. */
          this.content = '';
          /** The heading to display. */
          this.heading = '';
          /** Whether the component should be rendered in mobile view or not. */
          this.mobile = false;
      }
      static { this.styles = [KonstructElement.styles, styles$10]; }
      render() {
          return x `<div class="section-header" part="base"><slot class="section-header__heading" name="heading">${this.heading}</slot><slot class="section-header__content">${this.content}</slot><slot class="section-header__actions" name="actions"></slot></div>`;
      }
  };
  __decorate([
      n$5({ type: String }),
      __metadata("design:type", Object)
  ], exports.SectionHeader.prototype, "content", void 0);
  __decorate([
      n$5({ type: String }),
      __metadata("design:type", Object)
  ], exports.SectionHeader.prototype, "heading", void 0);
  __decorate([
      n$5({ type: Boolean }),
      __metadata("design:type", Object)
  ], exports.SectionHeader.prototype, "mobile", void 0);
  exports.SectionHeader = __decorate([
      customElement('section-header')
  ], exports.SectionHeader);

  var css_248z$$ = i$6`:host{box-sizing:content-box!important;color:inherit;display:inline-block;font-size:inherit;height:1em;line-height:inherit;width:1em}svg{display:block;height:100%;width:100%}`;
  var styles$$ = css_248z$$;
  styleInject(css_248z$$);

  /**
   * @element k-icon
   */
  exports.Icon = class Icon extends KonstructElement {
      constructor() {
          super(...arguments);
          this.label = '';
          /** The name of an icon library collection. */
          this.libraryName = 'system';
          this.icon = new IconLibraryController(this, () => ({
              iconName: this.iconName ?? '',
              mutator: (svg) => {
                  if (this.label) {
                      svg.setAttribute('role', 'img');
                      svg.setAttribute('aria-label', this.label);
                  }
                  else {
                      svg.setAttribute('aria-hidden', 'true');
                      svg.setAttribute('focusable', 'false');
                  }
              },
              path: this.path,
          }));
      }
      static { this.styles = [KonstructElement.styles, styles$$]; }
      get path() {
          const assetsPath = KONSTRUCT_ASSETS_PATH ?? '';
          switch (this.libraryName) {
              case 'crypto':
                  return `${assetsPath}/ui/icons/crypto`;
              case 'cursor':
                  return `${assetsPath}/ui/icons/cursor`;
              case 'kred':
                  return `${assetsPath}/ui/icons/kred`;
              case 'payment-method':
                  return `${assetsPath}/ui/icons/payment-method`;
              case 'rating':
                  return `${assetsPath}/ui/icons/rating`;
              case 'status':
                  return `${assetsPath}/ui/icons/status`;
              case 'system':
              default:
                  return `${assetsPath}/ui/icons/system`;
          }
      }
      render() {
          return this.icon.render();
      }
  };
  __decorate([
      n$5({ type: String }),
      __metadata("design:type", Object)
  ], exports.Icon.prototype, "label", void 0);
  __decorate([
      n$5({
          attribute: 'name',
          reflect: true,
      }),
      __metadata("design:type", String)
  ], exports.Icon.prototype, "iconName", void 0);
  __decorate([
      n$5({
          attribute: 'library',
          reflect: true,
      }),
      __metadata("design:type", Object)
  ], exports.Icon.prototype, "libraryName", void 0);
  exports.Icon = __decorate([
      customElement('icon')
  ], exports.Icon);

  var css_248z$_ = i$6`:host{--theme-border-color:inherit;display:inline-block}.indicator-icon{align-items:center;background-color:transparent;border:1px solid;border-radius:100px;display:inline-flex;justify-content:center;transition:background-color 75ms,border-color 75ms,color 75ms}.indicator-icon--xs{block-size:20px;font-size:12px;inline-size:20px}.indicator-icon--sm{block-size:24px;font-size:14px;inline-size:24px}.indicator-icon--md{block-size:28px;font-size:16px;inline-size:28px}.indicator-icon--lg{block-size:32px;font-size:19px;inline-size:32px}.indicator-icon--xl{block-size:36px;font-size:21px;inline-size:36px}.indicator-icon--xxl{block-size:40px;font-size:24px;inline-size:40px}.indicator-icon--default{color:var(--k-color-gray-900)}.indicator-icon--active.indicator-icon--default{background-color:var(--k-color-gray-100);border-color:var(--theme-border-color,var(--k-color-gray-100))}.indicator-icon--reversed{color:var(--k-color-white)}.indicator-icon--active.indicator-icon--reversed{background-color:var(--k-color-gray-900);border-color:var(--theme-border-color,var(--k-color-gray-900))}.indicator-icon--kong{color:var(--k-color-white)}.indicator-icon--active.indicator-icon--kong{background-color:var(--k-color-kong);border-color:var(--theme-border-color,var(--k-color-kong))}.indicator-icon__icon{opacity:0;transition:opacity 75ms}.indicator-icon--active .indicator-icon__icon{opacity:1}`;
  var styles$_ = css_248z$_;
  styleInject(css_248z$_);

  /**
   * An indicator icon conveys to a user if a feature has been applied
   *   or not.
   *
   * @element k-indicator-icon
   *
   * @csspart base - The base element container.
   * @csspart icon - The icon element.
   */
  exports.IndicatorIcon = class IndicatorIcon extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Indicates a currently active indicator. */
          this.active = false;
          /** The indicator's theme. */
          this.theme = 'reversed';
          /** The indicator size. */
          this.size = 'md';
          /** The variant of icon to be displayed. */
          this.variant = 'check';
      }
      static { this.styles = [KonstructElement.styles, styles$_]; }
      render() {
          return x `<div aria-label="Indicator icon" class="${classMap({
            'indicator-icon': true,
            'indicator-icon--active': this.active,
            [`indicator-icon--${this.size}`]: true,
            [`indicator-icon--${this.theme}`]: true,
        })}" part="base" role="img"><k-icon class="indicator-icon__icon" library="status" name="${this.variant}" part="icon"></k-icon><span class="sr-only">Indicator icon is ${this.active ? 'active' : 'not active'}</span></div>`;
      }
  };
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.IndicatorIcon.prototype, "active", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.IndicatorIcon.prototype, "theme", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.IndicatorIcon.prototype, "size", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.IndicatorIcon.prototype, "variant", void 0);
  exports.IndicatorIcon = __decorate([
      customElement('indicator-icon')
  ], exports.IndicatorIcon);

  var css_248z$Z = i$6`:host{box-sizing:content-box!important;color:inherit;display:inline-flex;font-size:inherit;height:1em;line-height:inherit;width:1em}.material-icons{display:inline-block;font-size:inherit;height:100%;text-decoration:none;width:100%}.material-icons__label{opacity:1}`;
  var styles$Z = css_248z$Z;
  styleInject(css_248z$Z);

  const MATERIAL_ICON_URL = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  /**
   * @element k-material-icon
   */
  exports.MaterialIcon = class MaterialIcon extends KonstructElement {
      constructor() {
          super(...arguments);
          this.name = '';
      }
      static { this.styles = [KonstructElement.styles, styles$Z]; }
      get formattedName() {
          // We use `kebab-case` for consistency, but the actual stylesheet for
          // the Material icon font formats with `snake_case`. This converts it back
          // so the icons actually load.
          return snakeCase$1(this.name);
      }
      render() {
          if (!this.name) {
              return;
          }
          return x `<i class="material-icons material-icons-outlined"><span class="material-icons__label">${this.formattedName}</span></i>`;
      }
      firstUpdated(changed) {
          super.firstUpdated(changed);
          this.loadFont(MATERIAL_ICON_URL);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.MaterialIcon.prototype, "name", void 0);
  exports.MaterialIcon = __decorate([
      customElement('material-icon')
  ], exports.MaterialIcon);

  class InputFieldBase extends KonstructElement {
      static { this.styles = [KonstructElement.styles]; }
      /**
       * Necessary for `attachInternals` to work properly in the constructor.
       * See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals
       */
      static { this.formAssociated = true; }
      constructor() {
          super();
          this.disabled = false;
          this.error = false;
          this.placeholder = '';
          this.value = '';
          this._focused = false;
          /**
           * Allows the element to be associated with a form.
           * See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals
           */
          this.internals = this.attachInternals?.();
      }
      get content() {
          return A;
      }
      get leadingContent() {
          // Override this getter to update the default content of the `leading` slot.
          return A;
      }
      get trailingContent() {
          // Override this getter to update the default content of the `trailing` slot.
          return A;
      }
      get errorContent() {
          if (!this.error) {
              return A;
          }
          return x `<svg class="input-field__error-icon" height="14" viewBox="0 0 16 14" width="16"><path fill="currentColor" d="M0.466797 13.1167L8.00013 0.083374L15.5335 13.1167H0.466797ZM8.0668 11.0334C8.21124 11.0334 8.33624 10.9806 8.4418 10.875C8.54735 10.7695 8.60013 10.6389 8.60013 10.4834C8.60013 10.3389 8.54735 10.2167 8.4418 10.1167C8.33624 10.0167 8.21124 9.96671 8.0668 9.96671C7.92235 9.96671 7.79735 10.0195 7.6918 10.125C7.58624 10.2306 7.53346 10.3556 7.53346 10.5C7.53346 10.6445 7.58624 10.7695 7.6918 10.875C7.79735 10.9806 7.92235 11.0334 8.0668 11.0334ZM7.5668 9.20004H8.5668V5.55004H7.5668V9.20004Z"/></svg>`;
      }
      firstUpdated(_changed) {
          super.firstUpdated(_changed);
          this.updateFormValue();
      }
      updated(_changed) {
          super.update(_changed);
          this.updateFormValue();
      }
      handleBlur(e) {
          e.preventDefault();
          this._focused = false;
      }
      handleFocus(e) {
          e.preventDefault();
          this._focused = true;
      }
      handleChange(e) {
          const target = e.target;
          this.value = String(target.value);
          this.updateFormValue();
      }
      focusField(e) {
          e.preventDefault();
          const el = this.shadowRoot?.querySelector('slot:not([name])')?.firstElementChild;
          if (el instanceof HTMLElement) {
              el.focus();
          }
      }
      updateFormValue() {
          this.internals.setFormValue(this.value ?? '');
      }
      willUpdate(...params) {
          super.willUpdate(...params);
      }
      render() {
          return x `<div ?disabled="${this.disabled}" ?error="${this.error}" ?focus="${this._focused}" @blur="${this.handleBlur}" @click="${this.focusField}" @focus="${this.handleFocus}" @keydown="${this.focusField}" class="input-field"><slot class="input-field__leading" name="leading">${this.leadingContent}</slot><slot class="input-field__content">${this.content}</slot><slot class="input-field__error" name="error">${this.errorContent}</slot><slot class="input-field__trailing" name="trailing">${this.trailingContent}</slot><span class="input-field__outline"></span></div>`;
      }
  }
  __decorate([
      n$5({
          attribute: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], InputFieldBase.prototype, "disabled", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], InputFieldBase.prototype, "error", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], InputFieldBase.prototype, "name", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], InputFieldBase.prototype, "placeholder", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], InputFieldBase.prototype, "value", void 0);
  __decorate([
      n$5({
          state: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], InputFieldBase.prototype, "_focused", void 0);

  const K_AFTER_HIDE_EVENT = 'k-after-hide';

  const K_AFTER_SHOW_EVENT = 'k-after-show';

  const K_BLUR_EVENT = 'k-blur';

  const K_CHANGE_EVENT = 'k-change';

  const K_CLICK_EVENT = 'k-click';

  const K_CLOSE_EVENT = 'k-close';

  const K_DISMISS_EVENT = 'k-dismiss';

  const K_FOCUS_EVENT = 'k-focus';

  const K_HIDE_EVENT = 'k-hide';

  const K_INPUT_EVENT = 'k-input';

  const K_REQUEST_CLOSE_EVENT = 'k-request-close';

  const K_SELECT_EVENT = 'k-select';

  const K_SHOW_EVENT = 'k-show';

  /**
   * Waits for a specific event to be emitted from an element.
   * Ignores events that bubble up from child elements.
   *
   * @param el {HTMLElement} is any HTMLElement
   * @param eventName {string} is the name of the event to wait for
   */
  const waitForEvent = async (el, eventName) => new Promise((resolve) => {
      function done(event) {
          if (event.target === el) {
              el.removeEventListener(eventName, done);
              resolve();
          }
      }
      el.addEventListener(eventName, done);
  });

  var css_248z$Y = i$6`:host{display:inline-block;position:relative}.dropdown::part(popup){z-index:var(--k-z-50)}.dropdown__panel::slotted(*){box-shadow:var(--k-shadow-lg)}.dropdown__panel--open{display:block;pointer-events:all}.dropdown__trigger{display:block}`;
  var styles$Y = css_248z$Y;
  styleInject(css_248z$Y);

  /**
   * @summary A dropdowns displays overlay content in a panel that can be hidden
   *   or shown by user interaction.
   *
   * @dependency konstruct-popup
   *
   * @slot - The dropdown's panel content.
   * @slot trigger - The dropdown trigger, usually a button.
   *
   * @csspart base - The base element container.
   * @csspart trigger - The wrapping container for a trigger, usually a button.
   * @csspart panel - The content panel which is shown when the dropdown is open.
   *
   */
  exports.Dropdown = class Dropdown extends KonstructElement {
      constructor() {
          super(...arguments);
          this.disabled = false;
          this.open = false;
          this.placement = 'top';
          this.distance = 0;
          this.skidding = 0;
      }
      static { this.styles = [KonstructElement.styles, styles$Y]; }
      addListeners() {
          this.panel.addEventListener(K_SELECT_EVENT, this.handlePanelSelect);
          this.panel.addEventListener('keydown', this.handleKeyDown);
          document.addEventListener('keydown', this.handleDocumentKeyDown);
          document.addEventListener('mousedown', this.handleDocumentMouseDown);
      }
      connectedCallback() {
          super.connectedCallback();
          this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
          this.handleDocumentMouseDown = this.handleDocumentMouseDown.bind(this);
          this.handleKeyDown = this.handleKeyDown.bind(this);
          this.handlePanelSelect = this.handlePanelSelect.bind(this);
      }
      disconnectedCallback() {
          super.disconnectedCallback();
          this.removeListeners();
          this.hide();
      }
      focusOnTrigger() {
          const trigger = this.trigger.assignedElements({ flatten: true })[0];
          if (typeof trigger?.focus === 'function') {
              trigger.focus();
          }
      }
      getMenu() {
          return this.panel
              .assignedElements({ flatten: true })
              .find((el) => el.tagName.toLowerCase() === 'konstruct-menu');
      }
      handleDocumentKeyDown(event) {
          /**
           * `Esc` key is pressed - hide the dropdown panel.
           */
          if (event.key === 'Escape' && this.open) {
              event.stopPropagation();
              this.focusOnTrigger();
              this.hide();
              return;
          }
          if (event.key === 'Tab') {
              /**
               * If tabbing in an open menu, close the dropdown panel and focus the trigger.
               */
              if (this.open &&
                  document.activeElement?.tagName.toLowerCase() === 'konstruct-menu-item') {
                  event.preventDefault();
                  this.hide();
                  this.focusOnTrigger();
                  return;
              }
              /**
               * If tabbing outside of this element, close the dropdown panel.
               * When used within a shadow DOM, find the active element within its
               * shadowRoot, otherwise `document.activeElement` would return the name
               * of the parent shadow DOM element.
               */
              setTimeout(() => {
                  const activeElement = this.getRootNode() instanceof ShadowRoot
                      ? document.activeElement?.shadowRoot?.activeElement
                      : document.activeElement;
                  if (activeElement?.closest(this.tagName.toLowerCase()) !== this) {
                      this.hide();
                  }
              });
          }
      }
      handleDocumentMouseDown(event) {
          /**
           * If clicked outside of this element, close the dropdown panel.
           */
          const path = event.composedPath();
          if (!path.includes(this)) {
              this.hide();
          }
      }
      handleKeyDown(event) {
          /**
           * If Esc key is pressed, hide the dropdown panel.
           */
          if (event.key === 'Escape' && this.open) {
              event.stopPropagation();
              this.hide();
              this.focusOnTrigger();
              return;
          }
      }
      handlePanelSelect(event) {
          const target = event.target;
          /**
           * If a menu item is selected, hide the dropdown.
           */
          if (target.tagName.toLowerCase() === 'konstruct-menu') {
              this.hide();
              this.focusOnTrigger();
          }
      }
      handleTriggerClick() {
          if (this.open) {
              this.hide();
          }
          else {
              this.show();
              this.focusOnTrigger();
          }
      }
      handleTriggerKeyDown(event) {
          /**
           * Show the panel but don't focus on the menu when <space> or <enter> is
           * pressed. This enables the user to press the same key again to hide
           * the menu when they do not want to make a selection.
           */
          if ([' ', 'Enter'].includes(event.key)) {
              event.preventDefault();
              this.handleTriggerClick();
              return;
          }
          const menu = this.getMenu();
          if (menu) {
              const menuItems = menu.getAllItems();
              const firstMenuItem = menuItems[0];
              const lastMenuItem = menuItems[menuItems.length - 1];
              /**
               * Focus and activate the first menu item when <up> or <down> is pressed.
               */
              if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                  event.preventDefault();
                  if (!this.open) {
                      this.show();
                  }
                  if (menuItems.length > 0) {
                      /**
                       * After showing the menu, focus either the first or last item,
                       * depending on which key is pressed.
                       */
                      this.updateComplete.then(() => {
                          if (event.key === 'ArrowDown' || event.key === 'Home') {
                              menu.setCurrentItem(firstMenuItem);
                              firstMenuItem.focus();
                          }
                          if (event.key === 'ArrowUp' || event.key === 'End') {
                              menu.setCurrentItem(lastMenuItem);
                              lastMenuItem.focus();
                          }
                      });
                  }
              }
          }
      }
      handleTriggerKeyUp(event) {
          /**
           * Prevent space from triggering a click event in Firefox
           */
          if (event.key === ' ') {
              event.preventDefault();
          }
      }
      hide() {
          if (!this.open) {
              return undefined;
          }
          this.open = false;
      }
      render() {
          return x `<k-popup ?active="${this.open}" class="${classMap({
            dropdown: true,
            'dropdown--open': this.open,
        })}" distance="${this.distance}" flip part="base" placement="${this.placement}" skidding="${this.skidding}"><slot class="dropdown__trigger" name="trigger" part="trigger" slot="anchor" @click="${this.toggle}" @keydown="${this.handleTriggerKeyDown}" @keyup="${this.handleTriggerKeyUp}"></slot><slot aria-hidden="${this.open ? 'false' : 'true'}" aria-labelledby="dropdown" class="dropdown__panel" part="panel"></slot></k-popup>`;
      }
      removeListeners() {
          if (this.panel) {
              this.panel.removeEventListener(K_SELECT_EVENT, this.handlePanelSelect);
              this.panel.removeEventListener('keydown', this.handleKeyDown);
          }
          document.removeEventListener('keydown', this.handleKeyDown);
          document.removeEventListener('mousedown', this.handleDocumentMouseDown);
      }
      show() {
          if (this.open) {
              return undefined;
          }
          this.open = true;
      }
      toggle() {
          if (this.open) {
              this.hide();
          }
          else {
              this.show();
          }
      }
      updated(changedProperties) {
          if (changedProperties.has('open')) {
              if (this.disabled) {
                  this.open = false;
                  return;
              }
              if (this.open) {
                  this.addListeners();
              }
              else {
                  this.removeListeners();
              }
          }
      }
  };
  __decorate([
      i$2('.dropdown'),
      __metadata("design:type", Function)
  ], exports.Dropdown.prototype, "popup", void 0);
  __decorate([
      i$2('.dropdown__trigger'),
      __metadata("design:type", HTMLSlotElement)
  ], exports.Dropdown.prototype, "trigger", void 0);
  __decorate([
      i$2('.dropdown__panel'),
      __metadata("design:type", HTMLSlotElement)
  ], exports.Dropdown.prototype, "panel", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Dropdown.prototype, "disabled", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Dropdown.prototype, "open", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Dropdown.prototype, "placement", void 0);
  __decorate([
      n$5({ type: Number }),
      __metadata("design:type", Object)
  ], exports.Dropdown.prototype, "distance", void 0);
  __decorate([
      n$5({ type: Number }),
      __metadata("design:type", Object)
  ], exports.Dropdown.prototype, "skidding", void 0);
  exports.Dropdown = __decorate([
      customElement('dropdown')
  ], exports.Dropdown);

  var css_248z$X = i$6`@keyframes pulse-dot{0%{transform:scale(.8)}50%{transform:scale(1)}to{transform:scale(.8)}}@keyframes pulse-ring{0%{transform:scale(.33)}80%,to{opacity:0}}:host{--dot-color:var(--k-color-success-400);--dot-width:6px;--dot-height:6px;display:inline-flex}.dot{align-items:center;display:inline-flex;justify-content:center;padding:1px;position:relative}.dot,.dot:after{height:var(--dot-height);width:var(--dot-width)}.dot:after{background:var(--dot-color);border-radius:50%;content:"";display:block;position:absolute}@media (prefers-reduced-motion:no-preference){.dot--pulse{animation:pulse-dot 1.25s cubic-bezier(.455,.03,.515,.955) -.4s infinite}.dot--pulse:before{animation:pulse-ring 1.25s cubic-bezier(.215,.61,.355,1) infinite;background:var(--dot-color);border-radius:50%;content:"";display:block;height:calc(var(--dot-height)*3);position:absolute;width:calc(var(--dot-width)*3)}}.dot--size-sm{--dot-width:6px;--dot-height:6px}.dot--size-md{--dot-width:8px;--dot-height:8px}.dot--size-lg{--dot-width:10px;--dot-height:10px}`;
  var styles$X = css_248z$X;
  styleInject(css_248z$X);

  /**
   * @element k-dot
   *
   * @csspart base - The component's base wrapper.
   *
   * @cssproperty --dot-color - The color of the dot.
   */
  exports.Dot = class Dot extends KonstructElement {
      constructor() {
          super(...arguments);
          /** If the dot should pulse. */
          this.pulse = false;
          /** The size of the dot. */
          this.size = 'md';
      }
      static { this.styles = [KonstructElement.styles, styles$X]; }
      render() {
          return x `<div class="${classMap({
            dot: true,
            [`dot--size-${this.size}`]: true,
            'dot--pulse': this.pulse,
        })}" part="base"></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Dot.prototype, "pulse", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Dot.prototype, "size", void 0);
  exports.Dot = __decorate([
      customElement('dot')
  ], exports.Dot);

  var css_248z$W = i$6`.account{align-items:center;background-color:var(--k-color-teal-500);border-radius:var(--k-size-3);color:var(--k-color-white);display:flex;gap:8px;justify-content:center}.account--bottom{block-size:50px;font-size:var(--k-font-size-lg);line-height:var(--k-line-height-lg)}.account--bottom,.account--top{font-weight:var(--k-font-weight-bold)}.account--top{block-size:110px;font-size:var(--k-font-size-xl);inline-size:100%;line-height:var(--k-line-height-xl)}.account--top--mobile{block-size:90px}.account--variant-sum{block-size:50px}`;
  var styles$W = css_248z$W;
  styleInject(css_248z$W);

  /**
   * The balance or sum of a user's kreds.
   *
   * @element k-kreds-account
   *
   * @slot - The accountâ€™s content.
   *
   * @csspart base - The base element container.
   * @csspart content - The content container.
   */
  exports.KredsAccount = class KredsAccount extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The display orientation. */
          this.orientation = 'top';
          /** The display variant. */
          this.variant = 'sum';
          /** The account mobile variant. */
          this.mobile = false;
          /** A background image. */
          this.image = '';
      }
      static { this.styles = [KonstructElement.styles, styles$W]; }
      render() {
          const backgroundImageStyle = this.image
              ? {
                  backgroundImage: `url(${this.image})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
              }
              : {};
          return x `<div class="${classMap({
            account: true,
            'account--mobile': this.mobile,
            [`account--${this.orientation}`]: true,
            [`account--${this.variant}`]: true,
        })}" part="base" style="${styleMap(backgroundImageStyle)}"><slot part="content"></slot></div>`;
      }
  };
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.KredsAccount.prototype, "orientation", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.KredsAccount.prototype, "variant", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.KredsAccount.prototype, "mobile", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.KredsAccount.prototype, "image", void 0);
  exports.KredsAccount = __decorate([
      customElement('kreds-account')
  ], exports.KredsAccount);

  var css_248z$V = i$6`:host{display:block}.item-top{align-items:center;background-color:var(--k-color-teal-500);background-position:50%;background-size:cover;border-radius:var(--k-size-3);display:flex;flex-direction:column;inline-size:100%;justify-content:center;overflow:hidden;padding:0}.item-top--kreds,.item-top--product-sm{block-size:110px}.item-top--kreds.item-top--mobile,.item-top--product-sm.item-top--mobile{block-size:90px}.item-top--product-lg{block-size:240px}.item-top--product-lg.item-top--mobile{block-size:200px}.item-top__image-container{aspect-ratio:1/1}.item-top__image{block-size:100%;display:block;inline-size:100%;-o-object-fit:cover;object-fit:cover}.item-top--product-sm .item-top__image-container{inline-size:90px}.item-top--product-sm.item-top--mobile .item-top__image-container{inline-size:70px}.item-top--product-lg .item-top__image-container{inline-size:140px}.item-top__container{align-items:center;block-size:100%;border-radius:var(--k-size-3);display:flex;gap:12px;inline-size:100%;justify-content:center;overflow:hidden}.item-top__product-label{color:var(--k-color-white);font-size:var(--k-font-size-xl);font-weight:var(--k-font-weight-bold);line-height:var(--k-line-height-xl);text-align:center}.item-top__content::slotted(*){display:flex}.item-top--with-background-image .item-top__container{-webkit-backdrop-filter:blur(var(--k-blur-md));backdrop-filter:blur(var(--k-blur-md))}`;
  var styles$V = css_248z$V;
  styleInject(css_248z$V);

  /**
   * A Top Item sits at the top of a kred purchasing modal.
   *
   * @element k-kreds-item-top
   *
   * @slot - The default slot.
   *
   * @csspart base - The base element container.
   * @csspart content - The content container.
   */
  exports.KredsItemTop = class KredsItemTop extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The item top variant. */
          this.variant = 'kreds';
          /** Whether the view is for mobile or not. */
          this.mobile = false;
          /** A background image. */
          this.backgroundImage = '';
          /** Add an image beside the slot content. */
          this.image = '';
          /** Add alt text to the image. */
          this.imageAlt = '';
      }
      static { this.styles = [KonstructElement.styles, styles$V]; }
      render() {
          return x `<div class="${classMap({
            'item-top': true,
            'item-top--mobile': this.mobile,
            'item-top--with-background-image': this.backgroundImage,
            [`item-top--${this.variant}`]: true,
        })}" part="base" style="${this.backgroundImage
            ? `background-image: url(${this.backgroundImage})`
            : ''}"><div class="item-top__container">${['product-sm', 'product-lg'].includes(this.variant)
            ? x `${this.image
                ? x `<div class="item-top__image-container"><img class="item-top__image" src="${this.image}" alt="${this.imageAlt}"></div>`
                : x `<div class="item-top__product-label">Product</div>`}`
            : A}<slot class="item-top__content" part="content"></slot></div></div>`;
      }
  };
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.KredsItemTop.prototype, "variant", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.KredsItemTop.prototype, "mobile", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.KredsItemTop.prototype, "backgroundImage", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.KredsItemTop.prototype, "image", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.KredsItemTop.prototype, "imageAlt", void 0);
  exports.KredsItemTop = __decorate([
      customElement('kreds-item-top')
  ], exports.KredsItemTop);

  var css_248z$U = i$6`:host{display:block}.list-item{align-items:center;border-radius:var(--k-size-1-5);display:flex;flex-direction:column;position:relative}.list-item--banner,.list-item--default.list-item--selected,.list-item--default.list-item:hover:not(.list-item--focused){--theme-effect:linear-gradient(var(--k-color-white),var(--k-color-white));background-color:var(--k-color-teal-500);box-shadow:none;color:var(--k-color-white)}.list-item--default.list-item:hover:not(.list-item--focused):not(.list-item--selected){--theme-border-color:var(--k-color-white)}.list-item__controls::slotted(k-kreds-price)::part(base){color:#fff}.list-item--default:focus{outline:0}.list-item--default.list-item--focused{box-shadow:var(--k-focus-ring-kong-4);outline:var(--k-size-px) solid var(--k-color-gray-100);outline-offset:calc(var(--k-size-px)*-1)}.list-item--default.list-item--focused:not(.list-item--selected){background-color:var(--k-color-white)}.list-item--selected.list-item--focused{outline-color:transparent}.list-item--banner{align-items:center;display:flex;flex-direction:column;font-weight:var(--k-font-weight-semibold);justify-content:center;padding-block:var(--k-size-4);padding-inline:var(--k-size-8)}.list-item--banner,.list-item--default{font-size:var(--k-font-size-base);line-height:var(--k-line-height-base)}.list-item--default{background-color:var(--k-color-white);box-shadow:inset 0 0 0 1px var(--k-color-gray-100);font-weight:var(--k-font-weight-bold);padding-block:var(--k-size-2-5);padding-inline:var(--k-size-3)}.list-item--info{align-items:center;display:flex;flex-direction:row;font-size:var(--k-font-size-xs);font-weight:var(--k-font-weight-medium);line-height:var(--k-line-height-sm);padding-block:var(--k-size-1);padding-inline:var(--k-size-1)}.list-item--info .list-item__content{display:flex;gap:var(--k-size-3)}.list-item--info .list-item__content::slotted(:not(:first-child)){padding-inline-start:12px}.list-item--info .list-item__content::slotted(:not(:first-child)):before{background-color:var(--k-color-gray-200);block-size:13px;content:"";display:block;inline-size:1px;inset-block-start:6px;inset-inline-start:0;position:absolute}.list-item--game-item,.list-item--order{color:var(--k-color-white);font-size:var(--k-font-size-xl);font-weight:var(--k-font-weight-bold);line-height:var(--k-line-height-xl)}.list-item--order{padding-block:var(--k-size-3);padding-inline:var(--k-size-3)}.list-item__content-wrapper{align-items:center;display:flex;flex-direction:row;gap:23px;inline-size:100%;justify-content:space-between;padding:0}.list-item--banner .list-item__content-wrapper{align-items:center;display:flex;flex-direction:column;gap:var(--k-size-1);justify-content:center;text-align:center}.list-item--info .list-item__content-wrapper{align-items:center;display:flex;flex-direction:row;gap:var(--k-size-3);justify-content:flex-end}.list-item__controls::slotted(*){align-items:center;display:flex;flex-direction:row;gap:var(--k-size-4);padding-block:var(--k-size-0-5)}.list-item__kreds::slotted(*){align-items:center;display:flex;flex-direction:row;gap:3px;justify-content:center;padding:0}`;
  var styles$U = css_248z$U;
  styleInject(css_248z$U);

  /**
   * A Kreds list item.
   *
   * @element k-kreds-list-item
   *
   * @slot - The list itemâ€™s content.
   * @slot controls - The right column of user controls.
   * @slot kreds - The left column of kred values.
   *
   * @csspart base - The base element container.
   * @csspart content - The item's content container.
   */
  exports.KredsListItem = class KredsListItem extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$U]; }
      constructor() {
          super();
          /** If the item is a discount. */
          this.discount = false;
          /** If the list item is currently selected. */
          this.selected = false;
          /** The list item display variant. */
          this.variant = 'reversed';
          this.hasFocus = false;
          this.addEventListener(K_INPUT_EVENT, this.handleInputEvent);
          this.addEventListener(K_BLUR_EVENT, this.handleBlurEvent);
          this.addEventListener(K_FOCUS_EVENT, this.handleFocusEvent);
      }
      get textEffectElements() {
          return this.kredsItems.map((element) => {
              return element?.querySelector('konstruct-text-effect');
          });
      }
      get priceElements() {
          return this.controlItems.map((element) => {
              return element?.querySelector('konstruct-kreds-price');
          });
      }
      render() {
          return x `<div class="${classMap({
            'list-item': true,
            'list-item--focused': this.hasFocus,
            'list-item--selected': this.selected,
            [`list-item--${this.variant}`]: true,
        })}" part="base" @mouseenter="${this.handleHoverIn}" @mouseleave="${this.handleHoverOut}"><div class="list-item__content-wrapper"><slot class="list-item__kreds" name="kreds"></slot><slot class="list-item__content" part="content"></slot><slot class="list-item__controls" name="controls" @slotchange="${this.handleControlsSlotChange}"></slot></div></div>`;
      }
      updated(changedProperties) {
          if (changedProperties.has('discount')) {
              this.priceElements.forEach((element) => {
                  if (this.discount) {
                      element?.setAttribute('discount', '');
                  }
                  else {
                      element?.removeAttribute('discount');
                  }
              });
          }
          if (changedProperties.has('selected')) {
              this.handleSelectedChange();
          }
      }
      handleBlurEvent() {
          this.hasFocus = false;
      }
      handleControlsSlotChange() {
          this.priceElements.forEach((element) => {
              if (['order', 'game-item'].includes(this.variant)) {
                  /** Only change the attribute if it hasn't been manually assigned */
                  if (!element?.hasAttribute('theme')) {
                      element?.setAttribute('theme', 'reversed');
                  }
              }
          });
      }
      handleHoverIn() {
          if (this.variant === 'default') {
              this.priceElements.forEach((element) => {
                  if (!this.selected) {
                      element?.setAttribute('theme', 'reversed');
                  }
              });
          }
      }
      handleHoverOut() {
          if (this.variant === 'default') {
              this.priceElements.forEach((element) => {
                  if (!this.selected) {
                      element?.setAttribute('theme', 'default');
                  }
              });
          }
      }
      /**
       * Because we want to display a focus ring around the entire rowâ€“even though
       * the row is not a focusable element, i.e. a button or inputâ€“we need to
       * manually check if the inner checkbox is in a focus-visible state and set
       * the internal `hasFocus` state accordingly.
       */
      handleFocusEvent(e) {
          const isFocusVisible = e.target.shadowRoot
              ?.querySelector('input[type="checkbox"]')
              ?.matches(':focus-visible');
          this.hasFocus = !!isFocusVisible;
      }
      handleInputEvent(e) {
          const target = e.target;
          this.selected = target.checked;
      }
      handleSelectedChange() {
          if (this.selected === true) {
              this.priceElements.forEach((element) => {
                  if (this.variant === 'default') {
                      element?.setAttribute('theme', 'reversed');
                  }
              });
          }
      }
  };
  __decorate([
      l$3({ flatten: true, slot: 'controls' }),
      __metadata("design:type", Array)
  ], exports.KredsListItem.prototype, "controlItems", void 0);
  __decorate([
      l$3({ flatten: true, slot: 'kreds' }),
      __metadata("design:type", Array)
  ], exports.KredsListItem.prototype, "kredsItems", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.KredsListItem.prototype, "discount", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.KredsListItem.prototype, "selected", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.KredsListItem.prototype, "variant", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.KredsListItem.prototype, "hasFocus", void 0);
  exports.KredsListItem = __decorate([
      customElement('kreds-list-item'),
      __metadata("design:paramtypes", [])
  ], exports.KredsListItem);

  var css_248z$T = i$6`:host{display:inline-block}.price{align-items:center;border-radius:0 4px 0 0;display:flex;flex-direction:row}.price--dollars{block-size:24px}.price--kreds{block-size:30px}.price__arrow{block-size:0;border-color:transparent;border-style:solid;inline-size:0}.price--dollars .price__arrow{border-width:12px 7px 12px 0}.price--kreds .price__arrow{border-width:15px 7px 15px 0}.price--default.price--discount.price--dollars .price__arrow{border-color:transparent var(--k-color-teal-500) transparent transparent}.price--discount.price--kreds .price__arrow,.price--reversed.price--discount.price--dollars .price__arrow{border-color:transparent var(--k-color-white) transparent transparent}.price__label{align-items:center;display:flex;flex-direction:row}.price--reversed .price__label{color:var(--k-color-white)}.price--dollars .price__label{font-size:var(--k-font-size-base);font-weight:var(--k-font-weight-bold);line-height:var(--k-line-height-md);padding-inline-end:4px;padding-inline-start:1px}.price--kreds .price__label{font-size:var(--k-font-size-xl);font-weight:var(--k-font-weight-bold);line-height:var(--k-line-height-xl);padding-inline-end:5px}.price--default.price--discount.price--kreds .price__label{background-color:var(--k-color-white)}.price--reversed.price--discount.price--dollars .price__label{background-color:var(--k-color-white);color:var(--k-color-gray-900)}.price--default.price--discount.price--dollars .price__label{background-color:var(--k-color-teal-500);color:var(--k-color-white)}`;
  var styles$T = css_248z$T;
  styleInject(css_248z$T);

  /**
   * A price tag.
   *
   * @element k-kreds-price
   *
   * @slot - The price tag content.
   *
   * @csspart base - The base element container.
   * @csspart label - The price tag value.
   */
  exports.KredsPrice = class KredsPrice extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether the price is discounted. */
          this.discount = false;
          /** If paying with dollars or kreds. */
          this.kreds = false;
          /** The price tag's theme. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$T]; }
      render() {
          return x `<div class="${classMap({
            price: true,
            'price--discount': this.discount,
            'price--dollars': !this.kreds,
            'price--kreds': this.kreds,
            [`price--${this.theme}`]: true,
        })}" part="base"><div class="price__arrow"></div><slot class="price__label" part="label"></slot></div>`;
      }
  };
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.KredsPrice.prototype, "discount", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.KredsPrice.prototype, "kreds", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.KredsPrice.prototype, "theme", void 0);
  exports.KredsPrice = __decorate([
      customElement('kreds-price')
  ], exports.KredsPrice);

  var css_248z$S = i$6`:host{display:inline-flex}.window{align-items:center;-webkit-backdrop-filter:blur(var(--k-blur-sm));backdrop-filter:blur(var(--k-blur-sm));background-color:var(--k-color-black-6);border:1px solid var(--k-color-white);border-radius:var(--k-size-2-5);color:var(--k-color-white);display:flex;font-weight:var(--k-font-weight-bold);justify-content:center;-webkit-user-select:none;-moz-user-select:none;user-select:none}.window--size-sm{block-size:34px;font-size:var(--k-font-size-lg);gap:6px;line-height:var(--k-line-height-lg);padding-block:3px;padding-inline:10px}.window--size-md{block-size:40px;font-size:var(--k-font-size-xl);gap:6px;line-height:var(--k-line-height-xl);padding-block:5px;padding-inline:12px}.window--size-lg{block-size:40px;font-size:var(--k-font-size-display-xs);font-weight:600;gap:6px;line-height:var(--k-line-height-display-xs);padding-block:4px;padding-inline:8px}.window--size-xl{block-size:64px;font-size:var(--k-font-size-display-lg);font-weight:700;gap:6px;line-height:var(--k-line-height-display-lg);padding-block:2px;padding-inline:12px}`;
  var styles$S = css_248z$S;
  styleInject(css_248z$S);

  /**
   * A "window" that represents a user's kred amount.
   *
   * @element k-kreds-window
   *
   * @slot - The windowâ€™s content, usually a number.
   *
   * @csspart base - The base element container.
   * @csspart content - The content container.
   */
  exports.KredsWindow = class KredsWindow extends KonstructElement {
      constructor() {
          super(...arguments);
          this.size = 'md';
      }
      static { this.styles = [KonstructElement.styles, styles$S]; }
      render() {
          return x `<slot class="${classMap({
            window: true,
            [`window--size-${this.size}`]: true,
        })}" part="base"></slot>`;
      }
  };
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.KredsWindow.prototype, "size", void 0);
  exports.KredsWindow = __decorate([
      customElement('kreds-window')
  ], exports.KredsWindow);

  var css_248z$R = i$6`:host{display:block;overflow:auto;overscroll-behavior:none;position:relative}.menu{align-items:flex-start;background-color:var(--k-color-white);display:flex;flex-direction:column}`;
  var styles$R = css_248z$R;
  styleInject(css_248z$R);

  /**
   * Menus contain a collection of menu-item options to choose from.
   *
   * @element k-menu
   *
   * @slot - The menu content, consisting of menu-items.
   *
   * @csspart base - The base element container.
   *
   * @event {{ item: MenuItem }} k-select - dispatched when a menu item
   *   is selected.
   */
  exports.Menu = class Menu extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$R]; }
      connectedCallback() {
          super.connectedCallback();
          this.setAttribute('role', 'menu');
      }
      render() {
          return x `<slot class="menu" part="base" @click="${this.handleClick}" @keydown="${this.handleKeyDown}" @mousedown="${this.handleMouseDown}" @slotchange="${this.handleSlotChange}"></slot>`;
      }
      getAllItems() {
          return [...this.defaultSlot.assignedElements({ flatten: true })].filter((el) => {
              if (!this.isMenuItem(el)) {
                  return false;
              }
              return true;
          });
      }
      /**
       * @internal Gets the current menu item, which is the menu item that has
       * `tabindex="0"` within the roving tab index. The menu item may or may not
       * have focus, but for keyboard interaction purposes it's considered the
       * "active" item.
       */
      getCurrentItem() {
          return this.getAllItems().find((i) => i.getAttribute('tabindex') === '0');
      }
      /**
       * @internal Sets the current menu item to the specified element. This sets
       * `tabindex="0"` on the target element and `tabindex="-1"` to all other
       * items. This method must be called prior to setting focus on a menu item.
       */
      setCurrentItem(item) {
          const items = this.getAllItems();
          // Update tab indexes
          items.forEach((i) => {
              i.setAttribute('tabindex', i === item ? '0' : '-1');
          });
      }
      handleClick(event) {
          const target = event.target;
          const item = target.closest('k-menu-item');
          if (!item) {
              return;
          }
          const clickEvent = new CustomEvent(K_CLICK_EVENT, {
              bubbles: true,
              composed: true,
              detail: { item },
          });
          this.dispatchEvent(clickEvent);
      }
      handleKeyDown(event) {
          /**
           * Select an item when pressing Enter
           */
          if (event.key === 'Enter') {
              const item = this.getCurrentItem();
              event.preventDefault();
              /**
               * Run @click handlers on menu items.
               */
              item?.click();
          }
          /**
           * When <space> is pressed, prevent scrolling.
           */
          if (event.key === ' ') {
              event.preventDefault();
          }
          /**
           * Move the selection with the up/down direction keys.
           */
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              const items = this.getAllItems();
              const activeItem = this.getCurrentItem();
              let index = activeItem ? items.indexOf(activeItem) : 0;
              if (items.length > 0) {
                  event.preventDefault();
                  if (event.key === 'ArrowDown') {
                      index++;
                  }
                  else if (event.key === 'ArrowUp') {
                      index--;
                  }
                  else if (event.key === 'Home') {
                      index = 0;
                  }
                  else if (event.key === 'End') {
                      index = items.length - 1;
                  }
                  if (index < 0) {
                      index = items.length - 1;
                  }
                  if (index > items.length - 1) {
                      index = 0;
                  }
                  const item = items[index];
                  this.setCurrentItem(item);
                  item.focus();
              }
          }
      }
      handleMouseDown(event) {
          const target = event.target;
          if (this.isMenuItem(target)) {
              this.setCurrentItem(target);
          }
      }
      handleSlotChange() {
          const items = this.getAllItems();
          /**
           * Reset the roving tab index when the slotted items change.
           */
          if (items.length > 0) {
              this.setCurrentItem(items[0]);
          }
      }
      isMenuItem(item) {
          return (item.tagName.toLowerCase() === 'konstruct-menu-item' ||
              ['menuitem', 'menuitemcheckbox', 'menuitemradio'].includes(item.getAttribute('role') ?? ''));
      }
  };
  __decorate([
      i$2('slot'),
      __metadata("design:type", HTMLSlotElement)
  ], exports.Menu.prototype, "defaultSlot", void 0);
  exports.Menu = __decorate([
      customElement('menu')
  ], exports.Menu);

  var css_248z$Q = i$6`:host{--width:240px;display:block}:host([inert]){display:none}.menu-item{align-items:center;background:0 0;border:0;cursor:pointer;display:flex;flex-direction:row;font-family:var(--k-font-sans);font-size:var(--k-size-3-5);font-weight:var(--k-font-weight-medium);gap:var(--k-size-3);inline-size:var(--width);justify-content:space-between;line-height:var(--k-size-5);padding-block:var(--k-size-2-5);padding-inline:var(--k-size-4);position:relative;-webkit-user-select:none;-moz-user-select:none;user-select:none}.menu-item,.menu-item__label{color:var(--k-color-gray-900)}.menu-item--disabled{color:var(--k-color-gray-400);cursor:not-allowed}.menu-item--link{text-decoration:none}:host(:focus){outline:0}:host(:focus-visible) .menu-item{background-color:var(--k-color-gray-100)}:host(:hover:not([aria-disabled=true])) .menu-item{background-color:var(--k-color-gray-100)}.menu-item__content{flex-direction:row;padding-block:0;padding-inline:0}.menu-item__content,.menu-item__leading{align-items:center;display:flex}.menu-item__leading::slotted(*){margin-inline-end:var(--k-size-3)}.menu-item__leading::slotted(*),.menu-item__trailing::slotted(*){display:flex}.menu-item__trailing{font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-normal);line-height:var(--k-line-height-sm)}.menu-item__trailing::slotted(*){margin-inline-start:var(--k-size-3)}`;
  var styles$Q = css_248z$Q;
  styleInject(css_248z$Q);

  /**
   * Menu items are options within a menu which a user may choose from.
   *
   * @element k-menu-item
   *
   * @slot - The menu item label.
   * @slot leading - Prepend an element before the menu item label.
   * @slot trailing - Append an element after the menu item label.
   *
   * @csspart base - The base element container.
   * @csspart leading - The leading element container.
   * @csspart label - The item label.
   * @csspart trailing - The trailing element container.
   *
   * @cssproperty --size - The size of the menu.
   */
  exports.MenuItem = class MenuItem extends KonstructElement {
      constructor() {
          super(...arguments);
          this.disabled = false;
          this.hrefAttribute = i `href`;
      }
      static { this.styles = [KonstructElement.styles, styles$Q]; }
      get tag() {
          if (this.href) {
              return i `a`;
          }
          else {
              return i `button`;
          }
      }
      connectedCallback() {
          super.connectedCallback();
          this.handleHostClick = this.handleHostClick.bind(this);
          this.addEventListener('click', this.handleHostClick);
      }
      firstUpdated() {
          if (!this.href && !this.type) {
              this.type = 'button';
          }
      }
      updated(changedProperties) {
          if (changedProperties.has('disabled')) {
              this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
          }
      }
      render() {
          return n `<${this.tag}
      class=${classMap({
            'menu-item': true,
            'menu-item--disabled': this.disabled,
            'menu-item--link': !!this.href,
        })}
      ${this.hrefAttribute}=${l$2(this.href)}
      type=${l$2(this.type)}
      part="base"
    >
      <div class="menu-item__content">
        <slot
          name="leading"
          part="leading"
          class="menu-item__leading"
        ></slot>
        <slot
          part="label"
          class="menu-item__label"
        ></slot>
      </div>
      <slot
        name="trailing"
        part="trailing"
        class="menu-item__trailing"
      ></slot>
    </${this.tag}>`;
      }
      handleHostClick(event) {
          /**
           * If the button is disabled, prevent the click event from being dispatched.
           */
          if (this.disabled) {
              event.preventDefault();
              event.stopImmediatePropagation();
          }
      }
  };
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.MenuItem.prototype, "disabled", void 0);
  __decorate([
      n$5({ reflect: true, type: String }),
      __metadata("design:type", String)
  ], exports.MenuItem.prototype, "href", void 0);
  __decorate([
      n$5({ reflect: true, type: String }),
      __metadata("design:type", String)
  ], exports.MenuItem.prototype, "type", void 0);
  exports.MenuItem = __decorate([
      customElement('menu-item')
  ], exports.MenuItem);

  function addUniqueItem(array, item) {
      array.indexOf(item) === -1 && array.push(item);
  }
  function removeItem(arr, item) {
      const index = arr.indexOf(item);
      index > -1 && arr.splice(index, 1);
  }

  const clamp = (min, max, v) => Math.min(Math.max(v, min), max);

  const defaults = {
      duration: 0.3,
      delay: 0,
      endDelay: 0,
      repeat: 0,
      easing: "ease",
  };

  const isNumber = (value) => typeof value === "number";

  const isEasingList = (easing) => Array.isArray(easing) && !isNumber(easing[0]);

  const wrap = (min, max, v) => {
      const rangeSize = max - min;
      return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
  };

  function getEasingForSegment(easing, i) {
      return isEasingList(easing)
          ? easing[wrap(0, easing.length, i)]
          : easing;
  }

  const mix = (min, max, progress) => -progress * min + progress * max + min;

  const noop = () => { };
  const noopReturn = (v) => v;

  const progress = (min, max, value) => max - min === 0 ? 1 : (value - min) / (max - min);

  function fillOffset(offset, remaining) {
      const min = offset[offset.length - 1];
      for (let i = 1; i <= remaining; i++) {
          const offsetProgress = progress(0, remaining, i);
          offset.push(mix(min, 1, offsetProgress));
      }
  }
  function defaultOffset(length) {
      const offset = [0];
      fillOffset(offset, length - 1);
      return offset;
  }

  function interpolate(output, input = defaultOffset(output.length), easing = noopReturn) {
      const length = output.length;
      /**
       * If the input length is lower than the output we
       * fill the input to match. This currently assumes the input
       * is an animation progress value so is a good candidate for
       * moving outside the function.
       */
      const remainder = length - input.length;
      remainder > 0 && fillOffset(input, remainder);
      return (t) => {
          let i = 0;
          for (; i < length - 2; i++) {
              if (t < input[i + 1])
                  break;
          }
          let progressInRange = clamp(0, 1, progress(input[i], input[i + 1], t));
          const segmentEasing = getEasingForSegment(easing, i);
          progressInRange = segmentEasing(progressInRange);
          return mix(output[i], output[i + 1], progressInRange);
      };
  }

  const isCubicBezier = (easing) => Array.isArray(easing) && isNumber(easing[0]);

  const isEasingGenerator = (easing) => typeof easing === "object" &&
      Boolean(easing.createAnimation);

  const isFunction = (value) => typeof value === "function";

  const isString = (value) => typeof value === "string";

  const time = {
      ms: (seconds) => seconds * 1000,
      s: (milliseconds) => milliseconds / 1000,
  };

  /*
    Bezier function generator

    This has been modified from GaÃ«tan Renaudeau's BezierEasing
    https://github.com/gre/bezier-easing/blob/master/src/index.js
    https://github.com/gre/bezier-easing/blob/master/LICENSE
    
    I've removed the newtonRaphsonIterate algo because in benchmarking it
    wasn't noticiably faster than binarySubdivision, indeed removing it
    usually improved times, depending on the curve.

    I also removed the lookup table, as for the added bundle size and loop we're
    only cutting ~4 or so subdivision iterations. I bumped the max iterations up
    to 12 to compensate and this still tended to be faster for no perceivable
    loss in accuracy.

    Usage
      const easeOut = cubicBezier(.17,.67,.83,.67);
      const x = easeOut(0.5); // returns 0.627...
  */
  // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
  const calcBezier = (t, a1, a2) => (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) * t;
  const subdivisionPrecision = 0.0000001;
  const subdivisionMaxIterations = 12;
  function binarySubdivide(x, lowerBound, upperBound, mX1, mX2) {
      let currentX;
      let currentT;
      let i = 0;
      do {
          currentT = lowerBound + (upperBound - lowerBound) / 2.0;
          currentX = calcBezier(currentT, mX1, mX2) - x;
          if (currentX > 0.0) {
              upperBound = currentT;
          }
          else {
              lowerBound = currentT;
          }
      } while (Math.abs(currentX) > subdivisionPrecision &&
          ++i < subdivisionMaxIterations);
      return currentT;
  }
  function cubicBezier(mX1, mY1, mX2, mY2) {
      // If this is a linear gradient, return linear easing
      if (mX1 === mY1 && mX2 === mY2)
          return noopReturn;
      const getTForX = (aX) => binarySubdivide(aX, 0, 1, mX1, mX2);
      // If animation is at start/end, return t without easing
      return (t) => t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2);
  }

  const steps = (steps, direction = "end") => (progress) => {
      progress =
          direction === "end"
              ? Math.min(progress, 0.999)
              : Math.max(progress, 0.001);
      const expanded = progress * steps;
      const rounded = direction === "end" ? Math.floor(expanded) : Math.ceil(expanded);
      return clamp(0, 1, rounded / steps);
  };

  const namedEasings = {
      ease: cubicBezier(0.25, 0.1, 0.25, 1.0),
      "ease-in": cubicBezier(0.42, 0.0, 1.0, 1.0),
      "ease-in-out": cubicBezier(0.42, 0.0, 0.58, 1.0),
      "ease-out": cubicBezier(0.0, 0.0, 0.58, 1.0),
  };
  const functionArgsRegex = /\((.*?)\)/;
  function getEasingFunction(definition) {
      // If already an easing function, return
      if (isFunction(definition))
          return definition;
      // If an easing curve definition, return bezier function
      if (isCubicBezier(definition))
          return cubicBezier(...definition);
      // If we have a predefined easing function, return
      if (namedEasings[definition])
          return namedEasings[definition];
      // If this is a steps function, attempt to create easing curve
      if (definition.startsWith("steps")) {
          const args = functionArgsRegex.exec(definition);
          if (args) {
              const argsArray = args[1].split(",");
              return steps(parseFloat(argsArray[0]), argsArray[1].trim());
          }
      }
      return noopReturn;
  }

  class Animation {
      constructor(output, keyframes = [0, 1], { easing, duration: initialDuration = defaults.duration, delay = defaults.delay, endDelay = defaults.endDelay, repeat = defaults.repeat, offset, direction = "normal", } = {}) {
          this.startTime = null;
          this.rate = 1;
          this.t = 0;
          this.cancelTimestamp = null;
          this.easing = noopReturn;
          this.duration = 0;
          this.totalDuration = 0;
          this.repeat = 0;
          this.playState = "idle";
          this.finished = new Promise((resolve, reject) => {
              this.resolve = resolve;
              this.reject = reject;
          });
          easing = easing || defaults.easing;
          if (isEasingGenerator(easing)) {
              const custom = easing.createAnimation(keyframes);
              easing = custom.easing;
              keyframes = custom.keyframes || keyframes;
              initialDuration = custom.duration || initialDuration;
          }
          this.repeat = repeat;
          this.easing = isEasingList(easing) ? noopReturn : getEasingFunction(easing);
          this.updateDuration(initialDuration);
          const interpolate$1 = interpolate(keyframes, offset, isEasingList(easing) ? easing.map(getEasingFunction) : noopReturn);
          this.tick = (timestamp) => {
              var _a;
              // TODO: Temporary fix for OptionsResolver typing
              delay = delay;
              let t = 0;
              if (this.pauseTime !== undefined) {
                  t = this.pauseTime;
              }
              else {
                  t = (timestamp - this.startTime) * this.rate;
              }
              this.t = t;
              // Convert to seconds
              t /= 1000;
              // Rebase on delay
              t = Math.max(t - delay, 0);
              /**
               * If this animation has finished, set the current time
               * to the total duration.
               */
              if (this.playState === "finished" && this.pauseTime === undefined) {
                  t = this.totalDuration;
              }
              /**
               * Get the current progress (0-1) of the animation. If t is >
               * than duration we'll get values like 2.5 (midway through the
               * third iteration)
               */
              const progress = t / this.duration;
              // TODO progress += iterationStart
              /**
               * Get the current iteration (0 indexed). For instance the floor of
               * 2.5 is 2.
               */
              let currentIteration = Math.floor(progress);
              /**
               * Get the current progress of the iteration by taking the remainder
               * so 2.5 is 0.5 through iteration 2
               */
              let iterationProgress = progress % 1.0;
              if (!iterationProgress && progress >= 1) {
                  iterationProgress = 1;
              }
              /**
               * If iteration progress is 1 we count that as the end
               * of the previous iteration.
               */
              iterationProgress === 1 && currentIteration--;
              /**
               * Reverse progress if we're not running in "normal" direction
               */
              const iterationIsOdd = currentIteration % 2;
              if (direction === "reverse" ||
                  (direction === "alternate" && iterationIsOdd) ||
                  (direction === "alternate-reverse" && !iterationIsOdd)) {
                  iterationProgress = 1 - iterationProgress;
              }
              const p = t >= this.totalDuration ? 1 : Math.min(iterationProgress, 1);
              const latest = interpolate$1(this.easing(p));
              output(latest);
              const isAnimationFinished = this.pauseTime === undefined &&
                  (this.playState === "finished" || t >= this.totalDuration + endDelay);
              if (isAnimationFinished) {
                  this.playState = "finished";
                  (_a = this.resolve) === null || _a === void 0 ? void 0 : _a.call(this, latest);
              }
              else if (this.playState !== "idle") {
                  this.frameRequestId = requestAnimationFrame(this.tick);
              }
          };
          this.play();
      }
      play() {
          const now = performance.now();
          this.playState = "running";
          if (this.pauseTime !== undefined) {
              this.startTime = now - this.pauseTime;
          }
          else if (!this.startTime) {
              this.startTime = now;
          }
          this.cancelTimestamp = this.startTime;
          this.pauseTime = undefined;
          this.frameRequestId = requestAnimationFrame(this.tick);
      }
      pause() {
          this.playState = "paused";
          this.pauseTime = this.t;
      }
      finish() {
          this.playState = "finished";
          this.tick(0);
      }
      stop() {
          var _a;
          this.playState = "idle";
          if (this.frameRequestId !== undefined) {
              cancelAnimationFrame(this.frameRequestId);
          }
          (_a = this.reject) === null || _a === void 0 ? void 0 : _a.call(this, false);
      }
      cancel() {
          this.stop();
          this.tick(this.cancelTimestamp);
      }
      reverse() {
          this.rate *= -1;
      }
      commitStyles() { }
      updateDuration(duration) {
          this.duration = duration;
          this.totalDuration = duration * (this.repeat + 1);
      }
      get currentTime() {
          return this.t;
      }
      set currentTime(t) {
          if (this.pauseTime !== undefined || this.rate === 0) {
              this.pauseTime = t;
          }
          else {
              this.startTime = performance.now() - t / this.rate;
          }
      }
      get playbackRate() {
          return this.rate;
      }
      set playbackRate(rate) {
          this.rate = rate;
      }
  }

  /**
   * The MotionValue tracks the state of a single animatable
   * value. Currently, updatedAt and current are unused. The
   * long term idea is to use this to minimise the number
   * of DOM reads, and to abstract the DOM interactions here.
   */
  class MotionValue {
      setAnimation(animation) {
          this.animation = animation;
          animation === null || animation === void 0 ? void 0 : animation.finished.then(() => this.clearAnimation()).catch(() => { });
      }
      clearAnimation() {
          this.animation = this.generator = undefined;
      }
  }

  const data = new WeakMap();
  function getAnimationData(element) {
      if (!data.has(element)) {
          data.set(element, {
              transforms: [],
              values: new Map(),
          });
      }
      return data.get(element);
  }
  function getMotionValue(motionValues, name) {
      if (!motionValues.has(name)) {
          motionValues.set(name, new MotionValue());
      }
      return motionValues.get(name);
  }

  /**
   * A list of all transformable axes. We'll use this list to generated a version
   * of each axes for each transform.
   */
  const axes = ["", "X", "Y", "Z"];
  /**
   * An ordered array of each transformable value. By default, transform values
   * will be sorted to this order.
   */
  const order = ["translate", "scale", "rotate", "skew"];
  const transformAlias = {
      x: "translateX",
      y: "translateY",
      z: "translateZ",
  };
  const rotation = {
      syntax: "<angle>",
      initialValue: "0deg",
      toDefaultUnit: (v) => v + "deg",
  };
  const baseTransformProperties = {
      translate: {
          syntax: "<length-percentage>",
          initialValue: "0px",
          toDefaultUnit: (v) => v + "px",
      },
      rotate: rotation,
      scale: {
          syntax: "<number>",
          initialValue: 1,
          toDefaultUnit: noopReturn,
      },
      skew: rotation,
  };
  const transformDefinitions = new Map();
  const asTransformCssVar = (name) => `--motion-${name}`;
  /**
   * Generate a list of every possible transform key
   */
  const transforms = ["x", "y", "z"];
  order.forEach((name) => {
      axes.forEach((axis) => {
          transforms.push(name + axis);
          transformDefinitions.set(asTransformCssVar(name + axis), baseTransformProperties[name]);
      });
  });
  /**
   * A function to use with Array.sort to sort transform keys by their default order.
   */
  const compareTransformOrder = (a, b) => transforms.indexOf(a) - transforms.indexOf(b);
  /**
   * Provide a quick way to check if a string is the name of a transform
   */
  const transformLookup = new Set(transforms);
  const isTransform = (name) => transformLookup.has(name);
  const addTransformToElement = (element, name) => {
      // Map x to translateX etc
      if (transformAlias[name])
          name = transformAlias[name];
      const { transforms } = getAnimationData(element);
      addUniqueItem(transforms, name);
      /**
       * TODO: An optimisation here could be to cache the transform in element data
       * and only update if this has changed.
       */
      element.style.transform = buildTransformTemplate(transforms);
  };
  const buildTransformTemplate = (transforms) => transforms
      .sort(compareTransformOrder)
      .reduce(transformListToString, "")
      .trim();
  const transformListToString = (template, name) => `${template} ${name}(var(${asTransformCssVar(name)}))`;

  const isCssVar = (name) => name.startsWith("--");
  const registeredProperties = new Set();
  function registerCssVariable(name) {
      if (registeredProperties.has(name))
          return;
      registeredProperties.add(name);
      try {
          const { syntax, initialValue } = transformDefinitions.has(name)
              ? transformDefinitions.get(name)
              : {};
          CSS.registerProperty({
              name,
              inherits: false,
              syntax,
              initialValue,
          });
      }
      catch (e) { }
  }

  const testAnimation = (keyframes, options) => document.createElement("div").animate(keyframes, options);
  const featureTests = {
      cssRegisterProperty: () => typeof CSS !== "undefined" &&
          Object.hasOwnProperty.call(CSS, "registerProperty"),
      waapi: () => Object.hasOwnProperty.call(Element.prototype, "animate"),
      partialKeyframes: () => {
          try {
              testAnimation({ opacity: [1] });
          }
          catch (e) {
              return false;
          }
          return true;
      },
      finished: () => Boolean(testAnimation({ opacity: [0, 1] }, { duration: 0.001 }).finished),
      linearEasing: () => {
          try {
              testAnimation({ opacity: 0 }, { easing: "linear(0, 1)" });
          }
          catch (e) {
              return false;
          }
          return true;
      },
  };
  const results = {};
  const supports = {};
  for (const key in featureTests) {
      supports[key] = () => {
          if (results[key] === undefined)
              results[key] = featureTests[key]();
          return results[key];
      };
  }

  // Create a linear easing point for every x second
  const resolution = 0.015;
  const generateLinearEasingPoints = (easing, duration) => {
      let points = "";
      const numPoints = Math.round(duration / resolution);
      for (let i = 0; i < numPoints; i++) {
          points += easing(progress(0, numPoints - 1, i)) + ", ";
      }
      return points.substring(0, points.length - 2);
  };
  const convertEasing = (easing, duration) => {
      if (isFunction(easing)) {
          return supports.linearEasing()
              ? `linear(${generateLinearEasingPoints(easing, duration)})`
              : defaults.easing;
      }
      else {
          return isCubicBezier(easing) ? cubicBezierAsString(easing) : easing;
      }
  };
  const cubicBezierAsString = ([a, b, c, d]) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;

  function hydrateKeyframes(keyframes, readInitialValue) {
      for (let i = 0; i < keyframes.length; i++) {
          if (keyframes[i] === null) {
              keyframes[i] = i ? keyframes[i - 1] : readInitialValue();
          }
      }
      return keyframes;
  }
  const keyframesList = (keyframes) => Array.isArray(keyframes) ? keyframes : [keyframes];

  function getStyleName(key) {
      if (transformAlias[key])
          key = transformAlias[key];
      return isTransform(key) ? asTransformCssVar(key) : key;
  }

  const style = {
      get: (element, name) => {
          name = getStyleName(name);
          let value = isCssVar(name)
              ? element.style.getPropertyValue(name)
              : getComputedStyle(element)[name];
          if (!value && value !== 0) {
              const definition = transformDefinitions.get(name);
              if (definition)
                  value = definition.initialValue;
          }
          return value;
      },
      set: (element, name, value) => {
          name = getStyleName(name);
          if (isCssVar(name)) {
              element.style.setProperty(name, value);
          }
          else {
              element.style[name] = value;
          }
      },
  };

  function stopAnimation(animation, needsCommit = true) {
      if (!animation || animation.playState === "finished")
          return;
      // Suppress error thrown by WAAPI
      try {
          if (animation.stop) {
              animation.stop();
          }
          else {
              needsCommit && animation.commitStyles();
              animation.cancel();
          }
      }
      catch (e) { }
  }

  function getUnitConverter(keyframes, definition) {
      var _a;
      let toUnit = (definition === null || definition === void 0 ? void 0 : definition.toDefaultUnit) || noopReturn;
      const finalKeyframe = keyframes[keyframes.length - 1];
      if (isString(finalKeyframe)) {
          const unit = ((_a = finalKeyframe.match(/(-?[\d.]+)([a-z%]*)/)) === null || _a === void 0 ? void 0 : _a[2]) || "";
          if (unit)
              toUnit = (value) => value + unit;
      }
      return toUnit;
  }

  function getDevToolsRecord() {
      return window.__MOTION_DEV_TOOLS_RECORD;
  }
  function animateStyle(element, key, keyframesDefinition, options = {}, AnimationPolyfill) {
      const record = getDevToolsRecord();
      const isRecording = options.record !== false && record;
      let animation;
      let { duration = defaults.duration, delay = defaults.delay, endDelay = defaults.endDelay, repeat = defaults.repeat, easing = defaults.easing, persist = false, direction, offset, allowWebkitAcceleration = false, } = options;
      const data = getAnimationData(element);
      const valueIsTransform = isTransform(key);
      let canAnimateNatively = supports.waapi();
      /**
       * If this is an individual transform, we need to map its
       * key to a CSS variable and update the element's transform style
       */
      valueIsTransform && addTransformToElement(element, key);
      const name = getStyleName(key);
      const motionValue = getMotionValue(data.values, name);
      /**
       * Get definition of value, this will be used to convert numerical
       * keyframes into the default value type.
       */
      const definition = transformDefinitions.get(name);
      /**
       * Stop the current animation, if any. Because this will trigger
       * commitStyles (DOM writes) and we might later trigger DOM reads,
       * this is fired now and we return a factory function to create
       * the actual animation that can get called in batch,
       */
      stopAnimation(motionValue.animation, !(isEasingGenerator(easing) && motionValue.generator) &&
          options.record !== false);
      /**
       * Batchable factory function containing all DOM reads.
       */
      return () => {
          const readInitialValue = () => { var _a, _b; return (_b = (_a = style.get(element, name)) !== null && _a !== void 0 ? _a : definition === null || definition === void 0 ? void 0 : definition.initialValue) !== null && _b !== void 0 ? _b : 0; };
          /**
           * Replace null values with the previous keyframe value, or read
           * it from the DOM if it's the first keyframe.
           */
          let keyframes = hydrateKeyframes(keyframesList(keyframesDefinition), readInitialValue);
          /**
           * Detect unit type of keyframes.
           */
          const toUnit = getUnitConverter(keyframes, definition);
          if (isEasingGenerator(easing)) {
              const custom = easing.createAnimation(keyframes, key !== "opacity", readInitialValue, name, motionValue);
              easing = custom.easing;
              keyframes = custom.keyframes || keyframes;
              duration = custom.duration || duration;
          }
          /**
           * If this is a CSS variable we need to register it with the browser
           * before it can be animated natively. We also set it with setProperty
           * rather than directly onto the element.style object.
           */
          if (isCssVar(name)) {
              if (supports.cssRegisterProperty()) {
                  registerCssVariable(name);
              }
              else {
                  canAnimateNatively = false;
              }
          }
          /**
           * If we've been passed a custom easing function, and this browser
           * does **not** support linear() easing, and the value is a transform
           * (and thus a pure number) we can still support the custom easing
           * by falling back to the animation polyfill.
           */
          if (valueIsTransform &&
              !supports.linearEasing() &&
              (isFunction(easing) || (isEasingList(easing) && easing.some(isFunction)))) {
              canAnimateNatively = false;
          }
          /**
           * If we can animate this value with WAAPI, do so.
           */
          if (canAnimateNatively) {
              /**
               * Convert numbers to default value types. Currently this only supports
               * transforms but it could also support other value types.
               */
              if (definition) {
                  keyframes = keyframes.map((value) => isNumber(value) ? definition.toDefaultUnit(value) : value);
              }
              /**
               * If this browser doesn't support partial/implicit keyframes we need to
               * explicitly provide one.
               */
              if (keyframes.length === 1 &&
                  (!supports.partialKeyframes() || isRecording)) {
                  keyframes.unshift(readInitialValue());
              }
              const animationOptions = {
                  delay: time.ms(delay),
                  duration: time.ms(duration),
                  endDelay: time.ms(endDelay),
                  easing: !isEasingList(easing)
                      ? convertEasing(easing, duration)
                      : undefined,
                  direction,
                  iterations: repeat + 1,
                  fill: "both",
              };
              animation = element.animate({
                  [name]: keyframes,
                  offset,
                  easing: isEasingList(easing)
                      ? easing.map((thisEasing) => convertEasing(thisEasing, duration))
                      : undefined,
              }, animationOptions);
              /**
               * Polyfill finished Promise in browsers that don't support it
               */
              if (!animation.finished) {
                  animation.finished = new Promise((resolve, reject) => {
                      animation.onfinish = resolve;
                      animation.oncancel = reject;
                  });
              }
              const target = keyframes[keyframes.length - 1];
              animation.finished
                  .then(() => {
                  if (persist)
                      return;
                  // Apply styles to target
                  style.set(element, name, target);
                  // Ensure fill modes don't persist
                  animation.cancel();
              })
                  .catch(noop);
              /**
               * This forces Webkit to run animations on the main thread by exploiting
               * this condition:
               * https://trac.webkit.org/browser/webkit/trunk/Source/WebCore/platform/graphics/ca/GraphicsLayerCA.cpp?rev=281238#L1099
               *
               * This fixes Webkit's timing bugs, like accelerated animations falling
               * out of sync with main thread animations and massive delays in starting
               * accelerated animations in WKWebView.
               */
              if (!allowWebkitAcceleration)
                  animation.playbackRate = 1.000001;
              /**
               * If we can't animate the value natively then we can fallback to the numbers-only
               * polyfill for transforms.
               */
          }
          else if (AnimationPolyfill && valueIsTransform) {
              /**
               * If any keyframe is a string (because we measured it from the DOM), we need to convert
               * it into a number before passing to the Animation polyfill.
               */
              keyframes = keyframes.map((value) => typeof value === "string" ? parseFloat(value) : value);
              /**
               * If we only have a single keyframe, we need to create an initial keyframe by reading
               * the current value from the DOM.
               */
              if (keyframes.length === 1) {
                  keyframes.unshift(parseFloat(readInitialValue()));
              }
              animation = new AnimationPolyfill((latest) => {
                  style.set(element, name, toUnit ? toUnit(latest) : latest);
              }, keyframes, Object.assign(Object.assign({}, options), { duration,
                  easing }));
          }
          else {
              const target = keyframes[keyframes.length - 1];
              style.set(element, name, definition && isNumber(target)
                  ? definition.toDefaultUnit(target)
                  : target);
          }
          if (isRecording) {
              record(element, key, keyframes, {
                  duration,
                  delay: delay,
                  easing,
                  repeat,
                  offset,
              }, "motion-one");
          }
          motionValue.setAnimation(animation);
          return animation;
      };
  }

  const getOptions = (options, key) => 
  /**
   * TODO: Make test for this
   * Always return a new object otherwise delay is overwritten by results of stagger
   * and this results in no stagger
   */
  options[key] ? Object.assign(Object.assign({}, options), options[key]) : Object.assign({}, options);

  function resolveElements(elements, selectorCache) {
      var _a;
      if (typeof elements === "string") {
          if (selectorCache) {
              (_a = selectorCache[elements]) !== null && _a !== void 0 ? _a : (selectorCache[elements] = document.querySelectorAll(elements));
              elements = selectorCache[elements];
          }
          else {
              elements = document.querySelectorAll(elements);
          }
      }
      else if (elements instanceof Element) {
          elements = [elements];
      }
      /**
       * Return an empty array
       */
      return Array.from(elements || []);
  }

  const createAnimation = (factory) => factory();
  const withControls = (animationFactory, options, duration = defaults.duration) => {
      return new Proxy({
          animations: animationFactory.map(createAnimation).filter(Boolean),
          duration,
          options,
      }, controls);
  };
  /**
   * TODO:
   * Currently this returns the first animation, ideally it would return
   * the first active animation.
   */
  const getActiveAnimation = (state) => state.animations[0];
  const controls = {
      get: (target, key) => {
          const activeAnimation = getActiveAnimation(target);
          switch (key) {
              case "duration":
                  return target.duration;
              case "currentTime":
                  return time.s((activeAnimation === null || activeAnimation === void 0 ? void 0 : activeAnimation[key]) || 0);
              case "playbackRate":
              case "playState":
                  return activeAnimation === null || activeAnimation === void 0 ? void 0 : activeAnimation[key];
              case "finished":
                  if (!target.finished) {
                      target.finished = Promise.all(target.animations.map(selectFinished)).catch(noop);
                  }
                  return target.finished;
              case "stop":
                  return () => {
                      target.animations.forEach((animation) => stopAnimation(animation));
                  };
              case "forEachNative":
                  /**
                   * This is for internal use only, fire a callback for each
                   * underlying animation.
                   */
                  return (callback) => {
                      target.animations.forEach((animation) => callback(animation, target));
                  };
              default:
                  return typeof (activeAnimation === null || activeAnimation === void 0 ? void 0 : activeAnimation[key]) === "undefined"
                      ? undefined
                      : () => target.animations.forEach((animation) => animation[key]());
          }
      },
      set: (target, key, value) => {
          switch (key) {
              case "currentTime":
                  value = time.ms(value);
              case "currentTime":
              case "playbackRate":
                  for (let i = 0; i < target.animations.length; i++) {
                      target.animations[i][key] = value;
                  }
                  return true;
          }
          return false;
      },
  };
  const selectFinished = (animation) => animation.finished;

  function stagger(duration = 0.1, { start = 0, from = 0, easing } = {}) {
      return (i, total) => {
          const fromIndex = isNumber(from) ? from : getFromIndex(from, total);
          const distance = Math.abs(fromIndex - i);
          let delay = duration * distance;
          if (easing) {
              const maxDelay = total * duration;
              const easingFunction = getEasingFunction(easing);
              delay = easingFunction(delay / maxDelay) * maxDelay;
          }
          return start + delay;
      };
  }
  function getFromIndex(from, total) {
      if (from === "first") {
          return 0;
      }
      else {
          const lastIndex = total - 1;
          return from === "last" ? lastIndex : lastIndex / 2;
      }
  }
  function resolveOption(option, i, total) {
      return isFunction(option) ? option(i, total) : option;
  }

  function createAnimate(AnimatePolyfill) {
      return function animate(elements, keyframes, options = {}) {
          elements = resolveElements(elements);
          const numElements = elements.length;
          /**
           * Create and start new animations
           */
          const animationFactories = [];
          for (let i = 0; i < numElements; i++) {
              const element = elements[i];
              for (const key in keyframes) {
                  const valueOptions = getOptions(options, key);
                  valueOptions.delay = resolveOption(valueOptions.delay, i, numElements);
                  const animation = animateStyle(element, key, keyframes[key], valueOptions, AnimatePolyfill);
                  animationFactories.push(animation);
              }
          }
          return withControls(animationFactories, options, 
          /**
           * TODO:
           * If easing is set to spring or glide, duration will be dynamically
           * generated. Ideally we would dynamically generate this from
           * animation.effect.getComputedTiming().duration but this isn't
           * supported in iOS13 or our number polyfill. Perhaps it's possible
           * to Proxy animations returned from animateStyle that has duration
           * as a getter.
           */
          options.duration);
      };
  }

  const animate$1 = createAnimate(Animation);

  function calcNextTime(current, next, prev, labels) {
      var _a;
      if (isNumber(next)) {
          return next;
      }
      else if (next.startsWith("-") || next.startsWith("+")) {
          return Math.max(0, current + parseFloat(next));
      }
      else if (next === "<") {
          return prev;
      }
      else {
          return (_a = labels.get(next)) !== null && _a !== void 0 ? _a : current;
      }
  }

  function eraseKeyframes(sequence, startTime, endTime) {
      for (let i = 0; i < sequence.length; i++) {
          const keyframe = sequence[i];
          if (keyframe.at > startTime && keyframe.at < endTime) {
              removeItem(sequence, keyframe);
              // If we remove this item we have to push the pointer back one
              i--;
          }
      }
  }
  function addKeyframes(sequence, keyframes, easing, offset, startTime, endTime) {
      /**
       * Erase every existing value between currentTime and targetTime,
       * this will essentially splice this timeline into any currently
       * defined ones.
       */
      eraseKeyframes(sequence, startTime, endTime);
      for (let i = 0; i < keyframes.length; i++) {
          sequence.push({
              value: keyframes[i],
              at: mix(startTime, endTime, offset[i]),
              easing: getEasingForSegment(easing, i),
          });
      }
  }

  function compareByTime(a, b) {
      if (a.at === b.at) {
          return a.value === null ? 1 : -1;
      }
      else {
          return a.at - b.at;
      }
  }

  function timeline(definition, options = {}) {
      var _a;
      const animationDefinitions = createAnimationsFromTimeline(definition, options);
      /**
       * Create and start animations
       */
      const animationFactories = animationDefinitions
          .map((definition) => animateStyle(...definition, Animation))
          .filter(Boolean);
      return withControls(animationFactories, options, 
      // Get the duration from the first animation definition
      (_a = animationDefinitions[0]) === null || _a === void 0 ? void 0 : _a[3].duration);
  }
  function createAnimationsFromTimeline(definition, _a = {}) {
      var { defaultOptions = {} } = _a, timelineOptions = __rest(_a, ["defaultOptions"]);
      const animationDefinitions = [];
      const elementSequences = new Map();
      const elementCache = {};
      const timeLabels = new Map();
      let prevTime = 0;
      let currentTime = 0;
      let totalDuration = 0;
      /**
       * Build the timeline by mapping over the definition array and converting
       * the definitions into keyframes and offsets with absolute time values.
       * These will later get converted into relative offsets in a second pass.
       */
      for (let i = 0; i < definition.length; i++) {
          const segment = definition[i];
          /**
           * If this is a timeline label, mark it and skip the rest of this iteration.
           */
          if (isString(segment)) {
              timeLabels.set(segment, currentTime);
              continue;
          }
          else if (!Array.isArray(segment)) {
              timeLabels.set(segment.name, calcNextTime(currentTime, segment.at, prevTime, timeLabels));
              continue;
          }
          const [elementDefinition, keyframes, options = {}] = segment;
          /**
           * If a relative or absolute time value has been specified we need to resolve
           * it in relation to the currentTime.
           */
          if (options.at !== undefined) {
              currentTime = calcNextTime(currentTime, options.at, prevTime, timeLabels);
          }
          /**
           * Keep track of the maximum duration in this definition. This will be
           * applied to currentTime once the definition has been parsed.
           */
          let maxDuration = 0;
          /**
           * Find all the elements specified in the definition and parse value
           * keyframes from their timeline definitions.
           */
          const elements = resolveElements(elementDefinition, elementCache);
          const numElements = elements.length;
          for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
              const element = elements[elementIndex];
              const elementSequence = getElementSequence(element, elementSequences);
              for (const key in keyframes) {
                  const valueSequence = getValueSequence(key, elementSequence);
                  let valueKeyframes = keyframesList(keyframes[key]);
                  const valueOptions = getOptions(options, key);
                  let { duration = defaultOptions.duration || defaults.duration, easing = defaultOptions.easing || defaults.easing, } = valueOptions;
                  if (isEasingGenerator(easing)) {
                      const custom = easing.createAnimation(valueKeyframes, key !== "opacity", () => 0, key);
                      easing = custom.easing;
                      valueKeyframes = custom.keyframes || valueKeyframes;
                      duration = custom.duration || duration;
                  }
                  const delay = resolveOption(options.delay, elementIndex, numElements) || 0;
                  const startTime = currentTime + delay;
                  const targetTime = startTime + duration;
                  /**
                   *
                   */
                  let { offset = defaultOffset(valueKeyframes.length) } = valueOptions;
                  /**
                   * If there's only one offset of 0, fill in a second with length 1
                   *
                   * TODO: Ensure there's a test that covers this removal
                   */
                  if (offset.length === 1 && offset[0] === 0) {
                      offset[1] = 1;
                  }
                  /**
                   * Fill out if offset if fewer offsets than keyframes
                   */
                  const remainder = offset.length - valueKeyframes.length;
                  remainder > 0 && fillOffset(offset, remainder);
                  /**
                   * If only one value has been set, ie [1], push a null to the start of
                   * the keyframe array. This will let us mark a keyframe at this point
                   * that will later be hydrated with the previous value.
                   */
                  valueKeyframes.length === 1 && valueKeyframes.unshift(null);
                  /**
                   * Add keyframes, mapping offsets to absolute time.
                   */
                  addKeyframes(valueSequence, valueKeyframes, easing, offset, startTime, targetTime);
                  maxDuration = Math.max(delay + duration, maxDuration);
                  totalDuration = Math.max(targetTime, totalDuration);
              }
          }
          prevTime = currentTime;
          currentTime += maxDuration;
      }
      /**
       * For every element and value combination create a new animation.
       */
      elementSequences.forEach((valueSequences, element) => {
          for (const key in valueSequences) {
              const valueSequence = valueSequences[key];
              /**
               * Arrange all the keyframes in ascending time order.
               */
              valueSequence.sort(compareByTime);
              const keyframes = [];
              const valueOffset = [];
              const valueEasing = [];
              /**
               * For each keyframe, translate absolute times into
               * relative offsets based on the total duration of the timeline.
               */
              for (let i = 0; i < valueSequence.length; i++) {
                  const { at, value, easing } = valueSequence[i];
                  keyframes.push(value);
                  valueOffset.push(progress(0, totalDuration, at));
                  valueEasing.push(easing || defaults.easing);
              }
              /**
               * If the first keyframe doesn't land on offset: 0
               * provide one by duplicating the initial keyframe. This ensures
               * it snaps to the first keyframe when the animation starts.
               */
              if (valueOffset[0] !== 0) {
                  valueOffset.unshift(0);
                  keyframes.unshift(keyframes[0]);
                  valueEasing.unshift("linear");
              }
              /**
               * If the last keyframe doesn't land on offset: 1
               * provide one with a null wildcard value. This will ensure it
               * stays static until the end of the animation.
               */
              if (valueOffset[valueOffset.length - 1] !== 1) {
                  valueOffset.push(1);
                  keyframes.push(null);
              }
              animationDefinitions.push([
                  element,
                  key,
                  keyframes,
                  Object.assign(Object.assign(Object.assign({}, defaultOptions), { duration: totalDuration, easing: valueEasing, offset: valueOffset }), timelineOptions),
              ]);
          }
      });
      return animationDefinitions;
  }
  function getElementSequence(element, sequences) {
      !sequences.has(element) && sequences.set(element, {});
      return sequences.get(element);
  }
  function getValueSequence(name, sequences) {
      if (!sequences[name])
          sequences[name] = [];
      return sequences[name];
  }

  function animateProgress(target, options = {}) {
      return withControls([
          () => {
              const animation = new Animation(target, [0, 1], options);
              animation.finished.catch(() => { });
              return animation;
          },
      ], options, options.duration);
  }
  function animate(target, keyframesOrOptions, options) {
      const factory = isFunction(target) ? animateProgress : animate$1;
      return factory(target, keyframesOrOptions, options);
  }

  var css_248z$P = i$6`:host{display:block}.modal{align-items:center;display:flex;inset:0;justify-content:center;overflow:hidden;position:fixed;z-index:var(--k-z-40)}.modal__actions{display:flex;margin-top:auto}.modal__actions::slotted(*){align-items:flex-start;display:flex;gap:var(--k-size-3)}.modal__background::slotted(*){height:100%;inset-block-start:0;inset-inline-start:0;overflow:hidden;position:absolute;width:100%;z-index:-1}.modal__background::slotted(*):after{background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.4));block-size:100%;content:"";display:block;inline-size:100%;inset-block-start:0;inset-inline-start:0;position:absolute}.modal__body{-webkit-overflow-scrolling:touch;flex:1 1 auto;overflow:auto}.modal__body,.modal__bottom{display:block}.modal__bottom::slotted(*){display:grid;gap:var(--k-size-6);inline-size:100%;justify-items:center;place-items:center}.modal__content{block-size:100%;display:flex;flex-direction:column;inline-size:100%;isolation:isolate;overflow:hidden;position:relative}.modal__overlay{-webkit-backdrop-filter:blur(var(--k-blur-md));backdrop-filter:blur(var(--k-blur-md));background-color:var(--k-color-black-12);filter:blur(0);inset:0;opacity:1;opacity:0;position:fixed;transition-property:opacity;z-index:-1}.modal__panel{background-color:var(--k-color-white);box-shadow:var(--k-shadow-xl);inline-size:auto;margin:var(--k-size-4);max-height:100%;max-width:100%;opacity:0;overflow:auto;position:relative}.modal__top{display:block}.modal__top::slotted(*){align-items:center;box-sizing:border-box;display:flex;flex-direction:column;gap:var(--k-size-4);inline-size:100%;justify-content:flex-start}`;
  var styles$P = css_248z$P;
  styleInject(css_248z$P);

  /**
   * @element k-modal
   *
   * @slot - The model panel content.
   * @slot actions - Actions to be displayed in the footer.
   * @slot background-image - A background image.
   * @slot top - Display content at the top of a modal.
   * @slot bottom - Display content at the bottom of a modal.
   *
   * @csspart actions - The footer actions container.
   * @csspart background - An optional background container.
   * @csspart base - The base content container.
   * @csspart body - The default content container.
   * @csspart container - The content container element.
   * @csspart overlay - The background overlay element.
   * @csspart top - The top content container.
   * @csspart bottom - The bottom content container.
   */
  exports.Modal = class Modal extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Close the modal when clicking the overlay. */
          this.closeOnOverlay = true;
          /**
           * Indicates if the modal is open.
           */
          this.open = false;
      }
      static { this.styles = [KonstructElement.styles, styles$P]; }
      /**
       * Return all focusable elements.
       */
      get focusableElements() {
          const contentRoot = this.contentItems[0];
          /**
           * @todo Use a more robust method of finding tabbable elements, similar to
           * https://github.com/focus-trap/tabbable
           */
          const elements = contentRoot?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          return elements || [];
      }
      /**
       * Return the first focusable element.
       */
      get firstFocusableElement() {
          return this.focusableElements[0];
      }
      /**
       * Return the last focusable element.
       */
      get lastFocusableElement() {
          return this.focusableElements[this.focusableElements.length - 1];
      }
      addListeners() {
          document.addEventListener('keydown', this.handleDocumentKeyDown);
      }
      connectedCallback() {
          super.connectedCallback();
          this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
      }
      disconnectedCallback() {
          super.disconnectedCallback();
          this.removeListeners();
          this.hide();
      }
      firstUpdated() {
          if (this.open) {
              this.removeAttribute('hidden');
          }
          else {
              this.setAttribute('hidden', '');
          }
          this.firstFocusableElement?.focus();
          this.handleOpenChange();
      }
      handleDocumentKeyDown(event) {
          /**
           * `Esc` key is pressed - hide the modal.
           */
          if (event.key === 'Escape' && this.open) {
              event.stopPropagation();
              this.requestClose('keyboard');
              return;
          }
          if (event.key !== 'Tab') {
              return;
          }
          /**
           * Create a "focus trap" within the modal, so that once it is opened it's
           * navigable using the keyboard.
           */
          if (event.shiftKey) {
              /**
               * If focus is on first element, shift + tab goes to last focusable element.
               */
              if (document.activeElement === this.firstFocusableElement) {
                  /**
                   * If focused is on the first element then add focus to last focusable element.
                   */
                  this.lastFocusableElement?.focus();
                  event.preventDefault();
              }
          }
          else {
              /**
               * If focus is on last element, move focus to first focusable element.
               */
              if (document.activeElement === this.lastFocusableElement) {
                  this.firstFocusableElement?.focus(); // add focus for the first focusable element
                  event.preventDefault();
              }
          }
      }
      async handleOpenChange() {
          if (this.open) {
              const showEvent = new CustomEvent('konstruct-show');
              this.dispatchEvent(showEvent);
              this.addListeners();
              this.originalTrigger = document.activeElement;
              const autoFocusTarget = this.querySelector('[autofocus]');
              this.removeAttribute('hidden');
              /**
               * Set initial focus.
               */
              requestAnimationFrame(() => {
                  const focusEvent = new CustomEvent('k-focus', {
                      cancelable: true,
                  });
                  this.dispatchEvent(focusEvent);
                  if (!focusEvent.defaultPrevented) {
                      if (autoFocusTarget) {
                          autoFocusTarget.focus({
                              preventScroll: true,
                          });
                      }
                      else {
                          this.panel.focus({ preventScroll: true });
                      }
                  }
              });
              const sequence = [
                  [this.overlay, { opacity: 1 }],
                  [this.panel, { opacity: 1, scale: 1, y: 0 }, { at: '<' }],
              ];
              const animation = timeline(sequence, { duration: 0.2 });
              animation.finished.then(() => {
                  if (this.open) {
                      this.removeAttribute('hidden');
                  }
              });
              const afterShowEvent = new CustomEvent('konstruct-after-show');
              this.dispatchEvent(afterShowEvent);
          }
          else {
              const hideEvent = new CustomEvent('konstruct-hide');
              this.dispatchEvent(hideEvent);
              this.removeListeners();
              const sequence = [
                  [this.overlay, { opacity: 0 }],
                  [this.panel, { opacity: 0, scale: 0.98, y: 5 }, { at: '<' }],
              ];
              const animation = timeline(sequence, { duration: 0.2 });
              animation.finished.then(() => {
                  if (!this.open) {
                      this.setAttribute('hidden', '');
                      /**
                       * Restore focus to the original trigger.
                       */
                      const trigger = this.originalTrigger;
                      if (typeof trigger?.focus === 'function') {
                          setTimeout(() => trigger.focus());
                      }
                      const afterHideEvent = new CustomEvent('konstruct-after-hide');
                      this.dispatchEvent(afterHideEvent);
                  }
              });
          }
      }
      async hide() {
          if (!this.open) {
              return undefined;
          }
          this.open = false;
      }
      removeListeners() {
          document.removeEventListener('keydown', this.handleDocumentKeyDown);
      }
      render() {
          return x `<div role="dialog" aria-hidden="${this.open ? 'false' : 'true'}" aria-modal="true" aria-label="modal" class="${classMap('modal', {
            'modal--open': this.open,
        })}" tabindex="-1"><div class="modal__overlay" part="overlay" @click="${() => this.requestClose('overlay')}" @keydown="${() => this.requestClose('overlay')}" style="${`${this.closeOnOverlay === false ? 'pointer-events: none' : ''}`}" tabindex="-1"></div><div class="modal__panel" part="base"><div class="modal__content" part="container"><slot class="modal__background" name="background" part="background"></slot><slot class="modal__top" name="top" part="top"></slot><slot class="modal__body" part="body"></slot><slot class="modal__bottom" name="bottom" part="bottom"></slot><slot class="modal__actions" name="actions" part="actions"></slot></div></div></div>`;
      }
      async show() {
          if (this.open) {
              return undefined;
          }
          this.open = true;
      }
      updated(changedProperties) {
          if (changedProperties.has('open')) {
              this.handleOpenChange();
          }
      }
      requestClose(source) {
          if (source === 'overlay' && this.closeOnOverlay === false) {
              return undefined;
          }
          const closeEvent = new CustomEvent(K_REQUEST_CLOSE_EVENT, {
              cancelable: true,
              detail: { source },
          });
          this.dispatchEvent(closeEvent);
          if (closeEvent.defaultPrevented) {
              // Possibly add an animated shake effect here.
              return;
          }
          this.hide();
      }
  };
  __decorate([
      i$2('.modal__overlay'),
      __metadata("design:type", HTMLSlotElement)
  ], exports.Modal.prototype, "overlay", void 0);
  __decorate([
      i$2('.modal__panel'),
      __metadata("design:type", HTMLSlotElement)
  ], exports.Modal.prototype, "panel", void 0);
  __decorate([
      l$3({ flatten: true, slot: '' }),
      __metadata("design:type", Array)
  ], exports.Modal.prototype, "contentItems", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Modal.prototype, "closeOnOverlay", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Modal.prototype, "open", void 0);
  exports.Modal = __decorate([
      customElement('modal')
  ], exports.Modal);

  /**
   * A base class for navigation components to extend from.
   *
   * @property view - The view of the navigation component. Can be either `desktop` or `mobile`. Defaults to `desktop`.
   * @property theme - The theme of the navigation component. Can be either `default` or `reversed`. Defaults to `default`.
   */
  class NavigationBase extends KonstructElement {
      constructor() {
          super(...arguments);
          this.view = 'desktop';
          this.theme = 'reversed';
      }
      /**
       * Whether or not the component is in `desktop` view.
       */
      get isDesktopView() {
          return this.view === 'desktop';
      }
      /**
       * Whether or not the component is in `mobile` view.
       */
      get isMobileView() {
          return this.view === 'mobile';
      }
  }
  __decorate([
      enumProperty({
          options: ['desktop', 'mobile'],
      }),
      __metadata("design:type", Object)
  ], NavigationBase.prototype, "view", void 0);
  __decorate([
      enumProperty({
          options: ['default', 'reversed', 'kong'],
      }),
      __metadata("design:type", Object)
  ], NavigationBase.prototype, "theme", void 0);

  var css_248z$O = i$6`:host{--nav-item-background--current:var(--k-color-gray-900);--nav-item-background--current--focus:var(--k-color-gray-900);--nav-item-background--focus:var(--k-color-white);--nav-item-background--hover:var(--k-color-kong);--nav-item-background:transparent;--nav-item-box-shadow--focus:var(--k-focus-ring-kong-4);--nav-item-box-shadow--current--focus:var(--k-focus-ring-kong-4);--nav-item-cta-color--current:var(--k-color-white);--nav-item-cta-color--current--focus:var(--k-color-white);--nav-item-cta-color--focus:var(--k-color-gray-900);--nav-item-cta-color--hover:var(--k-color-white);--nav-item-cta-color:var(--k-color-gray-900);--nav-item-cta-weight--current:var(--k-font-weight-semibold);--nav-item-cta-weight--current--focus:var(--k-font-weight-semibold);--nav-item-cta-weight--focus:var(--k-font-weight-bold);--nav-item-cta-weight--hover:var(--k-font-weight-semibold);--nav-item-cta-weight:var(--k-font-weight-bold);display:flex}.nav-item{align-items:center;background:var(--nav-item-background);border-radius:4px;border-style:none;display:inline-flex;flex-direction:row;font-family:var(--k-font-sans);justify-content:center;text-decoration:none}.nav-item--mobile.nav-item{height:auto;padding:8px 9px;width:100%}.nav-item--mobile.nav-item .nav-item.nav-item__cta{align-items:center;display:flex;height:28px;justify-content:center;padding:0 3px 1px}.nav-item--size-sm{height:30px;padding:1px 5px}.nav-item--size-sm .nav-item__cta{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.nav-item--size-lg{height:32px;padding:2px 5px}.nav-item--size-lg .nav-item__cta{font-size:var(--k-font-size-lg);line-height:var(--k-line-height-lg)}.nav-item--theme-kong{--nav-item-background--current:var(--k-color-white);--nav-item-background--current--focus:var(--k-color-white);--nav-item-background--focus:var(--k-color-kong);--nav-item-background--hover:var(--k-color-sheer-black-100);--nav-item-background:transparent;--nav-item-box-shadow--focus:var(--k-focus-ring-dark-4);--nav-item-box-shadow--current--focus:var(--k-focus-ring-dark-4);--nav-item-cta-color--current:var(--k-color-kong);--nav-item-cta-color--current--focus:var(--k-color-kong);--nav-item-cta-color--focus:var(--k-color-white);--nav-item-cta-color--hover:var(--k-color-white);--nav-item-cta-color:var(--k-color-white);--nav-item-cta-weight--current:var(--k-font-weight-bold);--nav-item-cta-weight--current--focus:var(--k-font-weight-bold);--nav-item-cta-weight--focus:var(--k-font-weight-semibold);--nav-item-cta-weight--hover:var(--k-font-weight-semibold);--nav-item-cta-weight:var(--k-font-weight-semibold)}.nav-item--theme-reversed{--nav-item-background--current:var(--k-color-white);--nav-item-background--current--focus:var(--k-color-white);--nav-item-background--focus:var(--k-color-gray-900);--nav-item-background--hover:var(--k-color-kong);--nav-item-background:transparent;--nav-item-box-shadow--focus:var(--k-focus-ring-kong-4);--nav-item-box-shadow--current--focus:var(--k-focus-ring-kong-4);--nav-item-cta-color--current:var(--k-color-gray-900);--nav-item-cta-color--current--focus:var(--k-color-gray-900);--nav-item-cta-color--focus:var(--k-color-white);--nav-item-cta-color--hover:var(--k-color-white);--nav-item-cta-color:var(--k-color-white);--nav-item-cta-weight--current:var(--k-font-weight-bold);--nav-item-cta-weight--current--focus:var(--k-font-weight-bold);--nav-item-cta-weight--focus:var(--k-font-weight-semibold);--nav-item-cta-weight--hover:var(--k-font-weight-semibold);--nav-item-cta-weight:var(--k-font-weight-semibold)}.nav-item--action-dropdown,.nav-item--action-link{padding-right:0;text-decoration:none}.nav-item--action-dropdown .nav-item__cta,.nav-item--action-link .nav-item__cta{padding-right:0}.nav-item:not(.nav-item--action-link){cursor:pointer}.nav-item--current{background:var(--nav-item-background--current)}.nav-item--current .nav-item__cta{font-weight:var(--nav-item-cta-weight--current)}.nav-item--current .nav-item__cta,.nav-item--current .nav-item__trailing-icon{color:var(--nav-item-cta-color--current)}.nav-item:hover:not(:focus-visible):not(.nav-item--current){background-color:var(--nav-item-background--hover)}.nav-item:hover:not(:focus-visible):not(.nav-item--current) .nav-item__cta{color:var(--nav-item-cta-color--hover);font-weight:var(--nav-item-cta-weight--hover)}.nav-item:hover:not(:focus-visible):not(.nav-item--current) .nav-item__trailing-icon{color:var(--nav-item-cta-color--hover)}.nav-item:focus{outline:0}.nav-item:focus-visible{box-shadow:var(--nav-item-box-shadow--focus)}.nav-item:focus-visible:not(.nav-item--current){background:var(--nav-item-background--focus);box-shadow:var(--nav-item-box-shadow--focus)}.nav-item:focus-visible:not(.nav-item--current) .nav-item__cta{color:var(--nav-item-cta-color--focus);font-weight:var(--nav-item-cta-weight--focus)}.nav-item:focus-visible.nav-item--current{background:var(--nav-item-background--current--focus);box-shadow:var(--nav-item-box-shadow--current--focus)}.nav-item:focus-visible.nav-item--current .nav-item__cta{color:var(--nav-item-cta-color--current--focus)}.nav-item__cta{align-items:center;color:var(--nav-item-cta-color);display:flex;flex-direction:column;font-weight:var(--nav-item-cta-weight);justify-content:center;padding:0 3px 1px;white-space:nowrap}.nav-item__cta:after{content:attr(data-text);content:attr(data-text)/"";font-weight:var(--k-font-weight-bold);height:0;overflow:hidden;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;visibility:hidden}@media speech{.nav-item__cta:after{display:none}}.nav-item__trailing-icon{color:var(--nav-item-cta-color);display:flex;font-size:24px}`;
  var styles$O = css_248z$O;
  styleInject(css_248z$O);

  /**
   * A nav item is a link or button that appears in the main navigation bar.
   *
   * @element nav-item
   *
   * @property {string} action - The action to use for the nav item. Defaults to `tab`.
   * @property {boolean} current - Whether the nav item is the current page. Defaults to `false`.
   * @property {string} href - The URL the nav item links to. If provided, the tag will be an `<a>` tag, otherwise it will be a `<button>` tag.
   * @property {boolean} mobile - If the nav item is for the mobile menu. Defaults to `false`.
   * @property {string} target - The target for the nav item.
   * @property {'sm'|'lg'} size - The size of the nav item. Defaults to `sm`.
   * @property {'desktop'|'mobile'} view - The view to use for the nav item. Defaults to `desktop`.
   *
   * @slot - The content of the nav item.
   *
   * @csspart base - The base wrapper for the nav item.
   * @csspart cta - The text content of the nav item.
   *
   * @cssproperty --nav-item-background--current - The background when current.
   * @cssproperty --nav-item-background--current--focus - The background when current and focused.
   * @cssproperty --nav-item-background--focus - The background when focused.
   * @cssproperty --nav-item-background--hover - The background when hovered.
   * @cssproperty --nav-item-background - The base background
   * @cssproperty --nav-item-box-shadow--focus - The box shadow when focused.
   * @cssproperty --nav-item-box-shadow--current--focus - The box shadow when current and focused.
   * @cssproperty --nav-item-cta-color--current - The text color when current.
   * @cssproperty --nav-item-cta-color--current--focus - The text color when current and focused.
   * @cssproperty --nav-item-cta-color--focus - The text color when focused.
   * @cssproperty --nav-item-cta-color--hover - The text color when hovered.
   * @cssproperty --nav-item-cta-color - The base text color.
   * @cssproperty --nav-item-cta-weight--current - The text weight when current.
   * @cssproperty --nav-item-cta-weight--current--focus - The text weight when current and focused.
   * @cssproperty --nav-item-cta-weight--focus - The text weight when focused.
   * @cssproperty --nav-item-cta-weight--hover - The text weight when hovered.
   * @cssproperty --nav-item-cta-weight - The base text weight.
   */
  exports.NavItem = class NavItem extends NavigationBase {
      constructor() {
          super(...arguments);
          this.action = 'tab';
          this.current = false;
          this.mobile = false;
          this.size = 'sm';
      }
      static { this.styles = [NavigationBase.styles, styles$O]; }
      get currentAttribute() {
          return i `data-current`;
      }
      get hrefAttribute() {
          return i `href`;
      }
      get targetAttribute() {
          return i `target`;
      }
      get tag() {
          if (this.href) {
              return i `a`;
          }
          return i `button`;
      }
      render() {
          return n `
      <${this.tag}
        class=${classMap({
            'nav-item': true,
            [`nav-item--current`]: this.current,
            [`nav-item--theme-${this.theme}`]: true,
            [`nav-item--action-${this.action}`]: true,
            [`nav-item--size-${this.size}`]: true,
            'nav-item--mobile': this.mobile,
        })}
        ?data-current=${this.current}
        part="base"
        ${this.hrefAttribute}=${l$2(this.href)}
        ${this.targetAttribute}=${l$2(this.target)}
        tabindex="0"
      >
        <slot
          class="nav-item__cta"
          part="cta"
          @slotchange=${this.handleSlotChange}
        ></slot>
        ${n$2(this.action === 'link', () => n `
            <div class="nav-item__trailing">
              <k-material-icon
                class="nav-item__trailing-icon"
                name="keyboard_arrow_right"
              ></k-material-icon>
            </div>
          `)}
        ${n$2(this.action === 'dropdown', () => n `
            <div class="nav-item__trailing">
              <k-material-icon
                class="nav-item__trailing-icon"
                name="keyboard_arrow_down"
              ></k-material-icon>
            </div>
          `)}
      </${this.tag}>
    `;
      }
      handleSlotChange() {
          /**
           * Prevent layout shift when hovering by setting a data-text attribute
           * with the text content of the slot. We can then use this for styling
           * a pseudo element with the bold variant.
           *
           * @see https://css-tricks.com/bold-on-hover-without-the-layout-shift/
           */
          const childNodes = this.cta?.assignedNodes({ flatten: true });
          const text = childNodes
              .map((node) => {
              return node.textContent ? node.textContent : '';
          })
              .join('')
              .trim();
          if (text.length > 0) {
              this.cta.setAttribute('data-text', text);
          }
      }
  };
  __decorate([
      enumProperty({
          options: ['tab', 'link', 'dropdown'],
      }),
      __metadata("design:type", Object)
  ], exports.NavItem.prototype, "action", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.NavItem.prototype, "current", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavItem.prototype, "href", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.NavItem.prototype, "mobile", void 0);
  __decorate([
      enumProperty({
          options: ['sm', 'lg'],
      }),
      __metadata("design:type", Object)
  ], exports.NavItem.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavItem.prototype, "target", void 0);
  __decorate([
      i$2('.nav-item__cta'),
      __metadata("design:type", HTMLSlotElement)
  ], exports.NavItem.prototype, "cta", void 0);
  exports.NavItem = __decorate([
      customElement('nav-item')
  ], exports.NavItem);

  var css_248z$N = i$6`:host{--background:var(--k-color-white);display:flex;position:relative}.navbar{align-items:center;background:var(--background);display:grid;gap:var(--k-size-4);grid-template-columns:1fr 2fr 1fr;height:60px;justify-content:space-between;padding:10px 20px;place-content:center;position:sticky;top:0;width:100%;z-index:var(--k-z-index-50)}.navbar--mobile{grid-template-columns:repeat(2,minmax(0,1fr));height:50px;padding:9px 12px}.navbar--theme-kong{--background:var(--k-color-kong)}.navbar--theme-reversed{--background:var(--k-color-gray-900)}.navbar--transparent.navbar{--background:transparent}.navbar__brand-icon,.navbar__brand-wordmark,.navbar__menu-toggle{display:flex}.navbar__menu-toggle-button{background:0 0;border-style:none;padding:0}.navbar__nav-actions{align-items:center;display:flex;justify-content:flex-end;width:100%}.navbar__mobile-menu-container{height:0;left:0;overflow:hidden;pointer-events:none;position:absolute;right:0;top:0;width:100%}.navbar__mobile-menu-container--open{height:100vh;overflow:scroll}.navbar__mobile-menu{align-items:center;align-self:stretch;background:var(--k-color-white);display:flex;flex-direction:column;gap:var(--k-size-2-5);overflow-y:auto;padding:82px 32px 32px;position:absolute;top:0;transform-origin:top;width:100%;z-index:var(--k-z-index-40)}.navbar__mobile-menu:after{background-image:var(--k-gradient-kong-glow);bottom:0;content:"";height:4px;left:0;position:absolute;width:100%}.navbar__mobile-menu::slotted(*){--nav-item-background--current:linear-gradient(105deg,#f04438 39.66%,#e478fa);display:flex;flex-direction:column;width:100%}.navbar__nav-items{align-items:center;display:flex;gap:var(--k-size-1-5);justify-content:center;width:100%}`;
  var styles$N = css_248z$N;
  styleInject(css_248z$N);

  /**
   * @element k-navbar
   *
   * @slot brand - The brand for the navbar.
   * @slot nav-items - The nav items for the navbar.
   * @slot nav-actions - Action controls for the navbar.
   * @slot mobile-nav-item - The nav items for the mobile menu.
   *
   * @csspart base - The base wrapper of the navbar.
   * @csspart mobile-menu - The mobile menu container.
   * @csspart nav-items - The nav items container.
   */
  exports.Navbar = class Navbar extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$N]; }
      constructor() {
          super();
          /** The navbar theme. */
          this.theme = 'reversed';
          /** If the navbar is on a transparent background. */
          this.transparent = false;
          /** If the view is mobile. */
          this.mobile = false;
          this.open = false;
          this.addController(new SlotController(this, {
              allow: [exports.KongIcon, exports.KongWordmark],
              setAttrs: () => ({
                  theme: this.logoTheme,
              }),
              slots: ['brand'],
          }));
          this.addController(new SlotController(this, {
              setAttrs: () => ({
                  theme: this.actionTheme,
              }),
              slots: ['nav-actions'],
          }));
          this.addController(new SlotController(this, {
              allow: [exports.NavItem],
              setAttrs: () => ({
                  mobile: this.mobile,
                  theme: this.mobile ? 'default' : this.theme,
              }),
              slots: ['nav-items'],
          }));
      }
      get actionTheme() {
          switch (this.theme) {
              case 'default':
                  return 'default';
              case 'reversed':
                  return 'reversed';
              case 'kong':
                  return 'reversed';
              default:
                  return 'default';
          }
      }
      get menuToggleTheme() {
          switch (this.theme) {
              case 'default':
                  return 'default';
              case 'reversed':
                  return 'reversed';
              case 'kong':
                  return 'reversed';
              default:
                  return 'default';
          }
      }
      get logoTheme() {
          switch (this.theme) {
              case 'default':
                  return 'reversed';
              case 'reversed':
                  return 'default';
              case 'kong':
                  return 'default';
              default:
                  return 'default';
          }
      }
      firstUpdated() {
          if (this.mobileMenu) {
              this.mobileMenu.hidden = !this.open;
          }
      }
      /** Hide the mobile menu */
      async hide() {
          this.open = false;
          return waitForEvent(this, K_AFTER_HIDE_EVENT);
      }
      /* Show the mobile menu */
      async show() {
          this.open = true;
          return waitForEvent(this, K_AFTER_SHOW_EVENT);
      }
      render() {
          return x `<nav class="${classMap({
            navbar: true,
            'navbar--mobile': this.mobile,
            'navbar--open': this.open,
            'navbar--transparent': this.transparent,
            [`navbar--theme-${this.theme}`]: true,
        })}" part="base"><div class="navbar__brand"><slot name="brand">${n$2(this.mobile, () => x `<k-kong-icon class="navbar__brand-icon" theme="${this.logoTheme}" width="24" variant="minimal"></k-kong-icon>`, () => x `<k-kong-wordmark class="navbar__brand-wordmark" width="283" height="24" theme="${this.logoTheme}"></k-kong-wordmark>`)}</slot></div>${n$2(!this.mobile, () => x `<slot class="navbar__nav-items" name="nav-items" part="nav-items"></slot>`)}<div class="navbar__nav-actions"><slot name="nav-actions"></slot>${n$2(this.mobile, () => x `<button class="navbar__menu-toggle-button" type="button" @click="${this.handleToggleClick}"><k-menu-toggle class="navbar__menu-toggle" ?open="${this.open}" theme="${this.menuToggleTheme}"></k-menu-toggle></button>`)}</div></nav>${n$2(this.mobile, () => x `<div class="${classMap('navbar__mobile-menu-container', {
            'navbar__mobile-menu-container--open': this.open,
        })}"><slot class="navbar__mobile-menu" ?hidden="${this.open === false}" name="nav-items" part="mobile-menu"></slot></div>`)}`;
      }
      updated(changedProperties) {
          if (changedProperties.has('open')) {
              this.handleOpenChange();
          }
      }
      async handleOpenChange() {
          if (this.open) {
              /** Show the mobile menu */
              const showEvent = new CustomEvent(K_SHOW_EVENT, {
                  bubbles: true,
                  composed: true,
              });
              this.dispatchEvent(showEvent);
              if (this.mobileMenu) {
                  const sequence = [
                      [
                          this.mobileMenu,
                          {
                              transform: ['translateY(-100%)', 'translateY(0)'],
                          },
                          {
                              duration: 0.36,
                              easing: [0.46, 1.38, 0.56, 1],
                          },
                      ],
                      [
                          this.navItems,
                          {
                              opacity: [0, 1],
                              scale: [0.9, 1],
                              y: ['-1rem', '0'],
                          },
                          {
                              at: '<',
                              delay: stagger(0.04, {
                                  easing: 'linear',
                                  from: 'first',
                                  start: 0.1,
                              }),
                              duration: 0.4,
                              easing: [0.43, 1.58, 0.47, 1.01],
                          },
                      ],
                  ];
                  timeline(sequence, {});
              }
              const afterShowEvent = new CustomEvent(K_AFTER_SHOW_EVENT);
              this.dispatchEvent(afterShowEvent);
          }
          else {
              /** Hide the mobile menu */
              const hideEvent = new CustomEvent(K_HIDE_EVENT, {
                  bubbles: true,
                  composed: true,
              });
              this.dispatchEvent(hideEvent);
              if (this.mobileMenu) {
                  const sequence = [
                      [
                          this.mobileMenu,
                          {
                              transform: ['translateY(0)', 'translateY(-100%)'],
                          },
                          { delay: 0.3, duration: 0.25, easing: 'ease-out' },
                      ],
                      [
                          this.navItems,
                          {
                              scale: [1, 0.9],
                              y: ['0', '-1rem'],
                          },
                          {
                              delay: stagger(0.04, {
                                  easing: [0.43, 1.58, 0.47, 1.01],
                                  from: 'last',
                                  start: 0,
                              }),
                              duration: 0.2,
                              easing: [0.43, 1.58, 0.47, 1.01],
                          },
                      ],
                  ];
                  timeline(sequence, {});
              }
              const afterHideEvent = new CustomEvent(K_AFTER_HIDE_EVENT);
              this.dispatchEvent(afterHideEvent);
              if (this.mobileMenu) {
                  this.mobileMenu.hidden = this.open === false;
              }
          }
      }
      handleToggleClick() {
          if (this.open) {
              this.hide();
          }
          else {
              this.show();
          }
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Navbar.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Navbar.prototype, "transparent", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Navbar.prototype, "mobile", void 0);
  __decorate([
      i$2('[part="base"]'),
      __metadata("design:type", HTMLElement)
  ], exports.Navbar.prototype, "base", void 0);
  __decorate([
      i$2('[part="mobile-menu"]'),
      __metadata("design:type", HTMLElement)
  ], exports.Navbar.prototype, "mobileMenu", void 0);
  __decorate([
      l$3({ flatten: true, slot: 'nav-items' }),
      __metadata("design:type", Array)
  ], exports.Navbar.prototype, "navItems", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.Navbar.prototype, "open", void 0);
  exports.Navbar = __decorate([
      customElement('navbar'),
      __metadata("design:paramtypes", [])
  ], exports.Navbar);

  var css_248z$M = i$6`:host{--nav-sign-in-color:var(--k-color-gray-900);--nav-sign-in-dot-color:var(--k-color-gray-900);--nav-sign-in-font-weight:var(--k-font-weight-bold);display:inline-block}.nav-sign-in{align-items:center;background:0 0;border-radius:4px;border-style:none;display:flex;gap:8px;height:32px;padding:0 4px 0 2px;white-space:nowrap}.nav-sign-in--theme-kong,.nav-sign-in--theme-reversed{--nav-sign-in-color:var(--k-color-white);--nav-sign-in-dot-color:var(--k-color-white);--nav-sign-in-font-weight:var(--k-font-weight-semibold)}.nav-sign-in:hover:not(:disabled){background:var(--k-color-sheer-black-100);cursor:pointer}.nav-sign-in__dot{--dot-color:var(--nav-sign-in-dot-color)}.nav-sign-in__label{color:var(--nav-sign-in-color);font-size:var(--k-font-size-lg);font-weight:var(--nav-sign-in-font-weight);line-height:var(--k-line-height-lg)}`;
  var styles$M = css_248z$M;
  styleInject(css_248z$M);

  /**
   * @element k-nav-sign-in
   *
   * @slot The text label for the nav sign in.
   *
   * @csspart base - The component's base wrapper.
   * @csspart label - The text label for the nav sign in.
   *
   * @event k-click - Emitted when the button is clicked.
   */
  exports.NavSignIn = class NavSignIn extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The theme to display the nav-sign-in in. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$M]; }
      render() {
          return x `<button class="${classMap({
            'nav-sign-in': true,
            [`nav-sign-in--theme-${this.theme}`]: true,
        })}" part="base" type="button" @click="${this.handleClick}"><k-dot class="nav-sign-in__dot" pulse size="lg"></k-dot><slot class="nav-sign-in__label" part="label">Sign In</slot></button>`;
      }
      handleClick() {
          const clickEvent = new CustomEvent(K_CLICK_EVENT, {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(clickEvent);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavSignIn.prototype, "theme", void 0);
  exports.NavSignIn = __decorate([
      customElement('nav-sign-in')
  ], exports.NavSignIn);

  var css_248z$L = i$6`:host{display:flex}.nav-section{align-items:flex-start;display:flex;flex-direction:column;gap:8px;width:100%}.nav-section--default{--color:var(--k-color-gray-900)}.nav-section--reversed{--color:var(--k-color-white)}.nav-section--mobile .nav-section__body{font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm);width:auto}.nav-section__body{align-items:flex-start;font-weight:400;width:50%}.nav-section__body,.nav-section__head{align-self:stretch;color:var(--color);display:flex;font-size:var(--k-font-size-lg);line-height:var(--k-line-height-lg)}.nav-section__head{align-items:center;font-weight:700;gap:10px;height:32px;justify-content:space-between}.nav-section__headline::slotted(*){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nav-section__controls{align-items:center;display:flex;gap:8px;justify-content:flex-end}.nav-section__tabs::slotted(*){align-items:center;display:flex;gap:4px}`;
  var styles$L = css_248z$L;
  styleInject(css_248z$L);

  /**
   * A k-nav-section organizes navigational content into several logical sections,
   * and contains various items such as a title/headline, tabs, search
   * capabilities, and dropdown menus.
   *
   * @element k-nav-section
   *
   * @slot - The body content.
   * @slot headline - The headline title.
   * @slot tabs - The tabbed content.
   *
   * @csspart base - The component's base wrapper.
   * @csspart body - The body of content that appears below navigational elements.
   * @csspart headline - The header of the nav-section containing navigational elements.
   */
  exports.NavSection = class NavSection extends KonstructElement {
      constructor() {
          super(...arguments);
          /** A mobile view, which modifies layout and typography sizes. */
          this.mobile = false;
          /** The nav-section theme. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$L]; }
      render() {
          return x `<section class="${classMap({
            'nav-section': true,
            [`nav-section--${this.theme}`]: true,
            'nav-section--mobile': this.mobile,
        })}" part="base"><header class="nav-section__head" part="head"><slot class="nav-section__headline" name="headline"></slot><div class="nav-section__controls"><slot class="nav-section__tabs" name="tabs" @slotchange="${this.handleTabsSlotChange}"></slot></div></header><slot class="nav-section__body" part="body"></slot></section>`;
      }
      updated(changedProperties) {
          if (changedProperties.has('theme')) {
              this.handleTabsSlotChange();
          }
      }
      handleTabsSlotChange() {
          this.tabs.forEach((tabs) => {
              const navItems = tabs.querySelectorAll('k-nav-item');
              navItems.forEach((navItem) => {
                  navItem.setAttribute('theme', this.theme);
              });
          });
      }
  };
  __decorate([
      l$3({ slot: 'tabs' }),
      __metadata("design:type", Array)
  ], exports.NavSection.prototype, "tabs", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.NavSection.prototype, "mobile", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavSection.prototype, "theme", void 0);
  exports.NavSection = __decorate([
      customElement('nav-section')
  ], exports.NavSection);

  var css_248z$K = i$6`:host{--nav-profile-user-color:var(--k-color-gray-900);display:flex}.nav-profile{--nav-profile-user-color:var(--k-color-gray-900);--nav-profile-user-font-weight:var(--k-font-weight-bold);display:flex;font-size:var(--k-font-size-lg);line-height:var(--k-line-height-lg)}.nav-profile--theme-reversed{--nav-profile-user-color:var(--k-color-white);--nav-profile-user-font-weight:var(--k-font-weight-semibold)}.nav-profile__avatar::slotted(*){pointer-events:none}.nav-profile__avatar-container{width:auto}.nav-profile__avatar-container,.nav-profile__badge{align-items:flex-start;display:flex;position:relative}.nav-profile__badge{align-self:stretch;flex-direction:column;gap:10px;margin-right:-11px;right:11px;top:3px}.nav-profile__badge::slotted(*){display:flex}.nav-profile__button{align-items:center;background:0 0;border-radius:32px 8px 8px 32px;border-style:none;display:inline-flex;flex-shrink:0;height:32px;padding-left:0;padding-right:4px}.nav-profile__button:hover:not(:disabled){background:var(--k-color-sheer-black-100);cursor:pointer}.nav-profile__user{align-items:center;align-self:stretch;color:var(--nav-profile-user-color);display:flex;font-size:var(--k-font-size-lg);font-weight:var(--nav-profile-user-font-weight);line-height:var(--k-line-height-lg);padding-bottom:0}`;
  var styles$K = css_248z$K;
  styleInject(css_248z$K);

  /**
   * @element k-nav-profile
   *
   * @slot avatar - The avatar to display for the nav profile.
   * @slot badge - The badge to display above the avatar.
   *
   * @csspart base - The component's base wrapper.
   * @csspart label - The label for the nav profile.
   * @csspart user - The user label container.
   *
   * @event k-click - Emitted when the button is clicked.
   */
  exports.NavProfile = class NavProfile extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Opens the profile menu. */
          this.open = false;
          /** The theme to display the nav-profile in. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$K]; }
      render() {
          return x `<div class="${classMap({
            'nav-profile': true,
            [`nav-profile--theme-${this.theme}`]: true,
            'nav-profile--open': this.open,
        })}" part="base"><button class="nav-profile__button" type="button" @click="${this.handleClick}"><div class="nav-profile__avatar-container"><slot class="nav-profile__avatar" name="avatar"></slot><slot class="nav-profile__badge" name="badge"></slot></div><div class="nav-profile__user" part="user"><slot class="nav-profile__label" part="label"></slot></div></button><slot class="nav-profile__menu" name="menu"></slot></div>`;
      }
      handleClick() {
          const clickEvent = new CustomEvent(K_CLICK_EVENT, {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(clickEvent);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.NavProfile.prototype, "open", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavProfile.prototype, "theme", void 0);
  exports.NavProfile = __decorate([
      customElement('nav-profile')
  ], exports.NavProfile);

  var css_248z$J = i$6`:host{display:flex}.nav-more{align-items:center;background:0 0;border-radius:4px;border-style:none;color:var(--k-color-gray-900);display:flex;flex-shrink:0;height:32px;justify-content:center;width:32px}.nav-more:hover:not(:disabled){background:rgba(0,0,0,.1);cursor:pointer}.nav-more--theme-reversed{color:var(--k-color-white)}`;
  var styles$J = css_248z$J;
  styleInject(css_248z$J);

  /**
   * @element k-nav-more
   *
   * @csspart base - The component's base wrapper.
   */
  exports.NavMore = class NavMore extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The theme to display the nav-more in. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$J]; }
      render() {
          return x `<button class="${classMap({
            'nav-more': true,
            [`nav-more--theme-${this.theme}`]: true,
        })}" part="base" type="button"><svg width="4" height="18" viewBox="0 0 4 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 4C3.10457 4 4 3.10457 4 2C4 0.895431 3.10457 0 2 0C0.895431 0 0 0.895431 0 2C0 3.10457 0.895431 4 2 4ZM2 11C3.10457 11 4 10.1046 4 9C4 7.89543 3.10457 7 2 7C0.895431 7 0 7.89543 0 9C0 10.1046 0.895431 11 2 11ZM4 16C4 17.1046 3.10457 18 2 18C0.895431 18 0 17.1046 0 16C0 14.8954 0.895431 14 2 14C3.10457 14 4 14.8954 4 16Z" fill="currentColor"/></svg></button>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavMore.prototype, "theme", void 0);
  exports.NavMore = __decorate([
      customElement('nav-more')
  ], exports.NavMore);

  var css_248z$I = i$6`:host{display:inline-flex}.nav-item-divider{align-items:center;display:flex;justify-content:center}.nav-item-divider--theme-default{color:var(--k-color-gray-900)}.nav-item-divider--theme-reversed{color:var(--k-color-white)}`;
  var styles$I = css_248z$I;
  styleInject(css_248z$I);

  /**
   * @element k-nav-item-divider
   *
   * @csspart base - The component's base wrapper.
   */
  exports.NavItemDivider = class NavItemDivider extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The theme to display the nav-item-divider in. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$I]; }
      render() {
          return x `<div class="${classMap({
            'nav-item-divider': true,
            [`nav-item-divider--theme-${this.theme}`]: true,
        })}" part="base"><svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:6px;height:6px"><circle cx="3" cy="3" r="3" fill="currentColor"/></svg></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavItemDivider.prototype, "theme", void 0);
  exports.NavItemDivider = __decorate([
      customElement('nav-item-divider')
  ], exports.NavItemDivider);

  var css_248z$H = i$6`:host{display:flex}.nav-alert{align-items:center;background:0 0;border-radius:4px;border-style:none;color:var(--k-color-gray-900);display:flex;flex-shrink:0;height:32px;justify-content:center;position:relative;width:32px}.nav-alert:hover:not(:disabled){background:rgba(0,0,0,.1)}.nav-alert--theme-reversed{color:var(--k-color-white)}.nav-alert__dot{inset-block-start:3px;inset-inline-end:3px;position:absolute}`;
  var styles$H = css_248z$H;
  styleInject(css_248z$H);

  /**
   * @element k-nav-alert
   *
   * @csspart base - The component's base wrapper.
   */
  exports.NavAlert = class NavAlert extends KonstructElement {
      constructor() {
          super(...arguments);
          /** If there is an active alert. */
          this.active = false;
          /** The link target. */
          this.target = '_top';
          /** The theme to display the nav-alert in. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$H]; }
      render() {
          return x `<a class="${classMap({
            'nav-alert': true,
            [`nav-alert--theme-${this.theme}`]: true,
        })}" part="base" href="${l$2(this.href)}" target="${this.target}"><svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 8V14.6H19.5V17H0.5V14.6H2V8C2 3.58 5.58 0 10 0C14.42 0 18 3.58 18 8ZM4.4 8V14.6H15.6V8C15.6 4.91 13.09 2.4 10 2.4C6.91 2.4 4.4 4.91 4.4 8ZM12.5 18C12.5 19.38 11.38 20.5 10 20.5C8.62 20.5 7.5 19.38 7.5 18H12.5Z" fill="currentColor"/></svg> ${n$2(this.active, () => x `<svg class="nav-alert__dot" width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 5C3.88071 5 5 3.88071 5 2.5C5 1.11929 3.88071 0 2.5 0C1.11929 0 0 1.11929 0 2.5C0 3.88071 1.11929 5 2.5 5Z" fill="currentColor"/></svg>`)}</a>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.NavAlert.prototype, "active", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavAlert.prototype, "href", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavAlert.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavAlert.prototype, "theme", void 0);
  exports.NavAlert = __decorate([
      customElement('nav-alert')
  ], exports.NavAlert);

  const K_MENU_TOGGLE_EVENT = 'k-menu-toggle';

  var css_248z$G = i$6`.menu-toggle{background:0 0;border:0;border-radius:4px;cursor:pointer;padding:0}.menu-toggle:hover{background:rgba(0,0,0,.1)}@media (hover:none){.menu-toggle{touch-action:manipulation}.menu-toggle:hover{background:0 0}}.menu-toggle--open .menu-toggle__bar{height:2.6px;width:16px}.menu-toggle--open .menu-toggle__bar-bottom{left:11.5;rotate:-45deg;top:15px}.menu-toggle--open .menu-toggle__bar-top{left:11.5;rotate:45deg;top:15px}.menu-toggle--theme-default .menu-toggle__bar{background-color:var(--k-color-gray-900)}.menu-toggle--theme-reversed .menu-toggle__bar{background-color:var(--k-color-white)}.menu-toggle__bar{height:2.6px;position:absolute;width:16px}.menu-toggle__bar-bottom{left:8px;top:18px}.menu-toggle__bar-top{left:8px;top:11px}@media (prefers-reduced-motion:no-preference){.menu-toggle__bar{transform-origin:center;transition:all .2s cubic-bezier(.08,.6,.54,.92)}}.menu-toggle__bars{align-items:center;block-size:32px;display:flex;flex-direction:column;inline-size:32px;justify-content:center;position:relative}`;
  var styles$G = css_248z$G;
  styleInject(css_248z$G);

  exports.MenuToggle = class MenuToggle extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Opens the menu. */
          this.open = false;
          /** The theme to display the nav-alert in. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$G]; }
      render() {
          return x `<button aria-expanded="${this.open}" class="${classMap({
            'menu-toggle': true,
            'menu-toggle--open': this.open,
            [`menu-toggle--theme-${this.theme}`]: true,
        })}" @click="${this.handleToggle}" part="base"><div class="menu-toggle__bars"><div class="menu-toggle__bar menu-toggle__bar-top"></div><div class="menu-toggle__bar menu-toggle__bar-bottom"></div></div></button>`;
      }
      handleToggle() {
          this.open = !this.open;
          const toggleEvent = new CustomEvent(K_MENU_TOGGLE_EVENT, {
              bubbles: true,
              composed: true,
              detail: { open: this.open },
          });
          this.dispatchEvent(toggleEvent);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.MenuToggle.prototype, "open", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.MenuToggle.prototype, "theme", void 0);
  exports.MenuToggle = __decorate([
      customElement('menu-toggle')
  ], exports.MenuToggle);

  var css_248z$F = i$6`:host{display:flex}.nav-kred{align-items:flex-start;background:0 0;border-radius:32px 8px 8px 32px;border-style:none;display:inline-flex;padding-bottom:1px;position:relative;text-decoration:none}.nav-kred:hover:not(:disabled){background:var(--k-color-sheer-black-100);cursor:pointer}.nav-kred__kred{align-items:flex-start;display:flex;font-size:28px;height:32px;position:absolute;width:32px}.nav-kred__badge{display:inline-block;padding:13px 0 0 21px;position:relative}.nav-kred__badge::slotted(*){display:flex;pointer-events:none}`;
  var styles$F = css_248z$F;
  styleInject(css_248z$F);

  /**
   * @element k-nav-kred
   *
   * @csspart base - The component's base wrapper.
   *
   * @slot kred - The kred icon.
   * @slot badge - The badge content.
   */
  exports.NavKred = class NavKred extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$F]; }
      constructor() {
          super();
          /** The link target. */
          this.target = '_top';
          /** The theme to display the nav-kred in. */
          this.theme = 'reversed';
          this.addController(new SlotController(this, {
              setAttrs: () => ({
                  theme: this.theme,
              }),
              slots: ['badge'],
          }));
      }
      render() {
          return x `<a class="${classMap({
            'nav-kred': true,
            [`nav-kred--theme-${this.theme}`]: true,
        })}" part="base" href="${l$2(this.href)}" target="${this.target}"><slot class="nav-kred__kred" name="kred"><k-icon library="kred" name="kred-classic"></k-icon></slot><slot class="nav-kred__badge" name="badge"></slot></a>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavKred.prototype, "href", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavKred.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.NavKred.prototype, "theme", void 0);
  exports.NavKred = __decorate([
      customElement('nav-kred'),
      __metadata("design:paramtypes", [])
  ], exports.NavKred);

  /**
   * Creates a base function for methods like `_.forIn` and `_.forOwn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */

  function createBaseFor$1(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  var _createBaseFor = createBaseFor$1;

  var createBaseFor = _createBaseFor;

  /**
   * The base implementation of `baseForOwn` which iterates over `object`
   * properties returned by `keysFunc` and invokes `iteratee` for each property.
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
  var baseFor$1 = createBaseFor();

  var _baseFor = baseFor$1;

  var baseFor = _baseFor,
      keys = keys_1;

  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwn$1(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }

  var _baseForOwn = baseForOwn$1;

  var isArrayLike$1 = isArrayLike_1;

  /**
   * Creates a `baseEach` or `baseEachRight` function.
   *
   * @private
   * @param {Function} eachFunc The function to iterate over a collection.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseEach$1(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike$1(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length,
          index = fromRight ? length : -1,
          iterable = Object(collection);

      while ((fromRight ? index-- : ++index < length)) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  var _createBaseEach = createBaseEach$1;

  var baseForOwn = _baseForOwn,
      createBaseEach = _createBaseEach;

  /**
   * The base implementation of `_.forEach` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   */
  var baseEach$1 = createBaseEach(baseForOwn);

  var _baseEach = baseEach$1;

  var baseEach = _baseEach,
      isArrayLike = isArrayLike_1;

  /**
   * The base implementation of `_.map` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function baseMap$1(collection, iteratee) {
    var index = -1,
        result = isArrayLike(collection) ? Array(collection.length) : [];

    baseEach(collection, function(value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });
    return result;
  }

  var _baseMap = baseMap$1;

  var arrayMap = _arrayMap,
      baseIteratee = _baseIteratee,
      baseMap = _baseMap,
      isArray = isArray_1;

  /**
   * Creates an array of values by running each element in `collection` thru
   * `iteratee`. The iteratee is invoked with three arguments:
   * (value, index|key, collection).
   *
   * Many lodash methods are guarded to work as iteratees for methods like
   * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
   *
   * The guarded methods are:
   * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
   * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
   * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
   * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   * @example
   *
   * function square(n) {
   *   return n * n;
   * }
   *
   * _.map([4, 8], square);
   * // => [16, 64]
   *
   * _.map({ 'a': 4, 'b': 8 }, square);
   * // => [16, 64] (iteration order is not guaranteed)
   *
   * var users = [
   *   { 'user': 'barney' },
   *   { 'user': 'fred' }
   * ];
   *
   * // The `_.property` iteratee shorthand.
   * _.map(users, 'user');
   * // => ['barney', 'fred']
   */
  function map$1(collection, iteratee) {
    var func = isArray(collection) ? arrayMap : baseMap;
    return func(collection, baseIteratee(iteratee));
  }

  var map_1 = map$1;

  var baseFlatten = _baseFlatten,
      map = map_1;

  /**
   * Creates a flattened array of values by running each element in `collection`
   * thru `iteratee` and flattening the mapped results. The iteratee is invoked
   * with three arguments: (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * function duplicate(n) {
   *   return [n, n];
   * }
   *
   * _.flatMap([1, 2], duplicate);
   * // => [1, 1, 2, 2]
   */
  function flatMap(collection, iteratee) {
    return baseFlatten(map(collection, iteratee), 1);
  }

  var flatMap_1 = flatMap;

  var flatMap$1 = /*@__PURE__*/getDefaultExportFromCjs(flatMap_1);

  const PAGE_SEPARATOR = '...';

  /**
   * Returns a flattened array where the provided values are separated by
   * a `PageSeparator`.
   *
   * @param params is any number of `number` values or arrays of `number` values
   */
  const joinWithSeparator = (...params) => flatMap$1(params)
      .sort((a, b) => a - b)
      .reduce((acc, page) => {
      if (acc.length === 0) {
          return [page];
      }
      if (acc[acc.length - 1] < page - 1) {
          acc.push(PAGE_SEPARATOR);
      }
      return [...acc, page];
  }, []);

  const ascendingPageNumbers = (length, startingAt = 1) => {
      const pages = [...Array(length).keys()];
      return pages.map((_, i) => i + startingAt);
  };
  const descendingPageNumbers = (length, endingAt = length) => {
      const pages = [...Array(length).keys()];
      return pages.map((_, i) => endingAt - i);
  };

  /**
   * Creates a flattened array of visible page numbers for use in pagination.
   * The values in the array can either be a number or a string of `'...'`.
   * Parsing the returned value is the responsibility of consumer.
   */
  const pageNumbers = ({ pagePadding: padding = 2, totalPages, ...config }) => {
      const currentPage = config.currentPage
          ? config.currentPage > totalPages
              ? totalPages
              : config.currentPage
          : 1;
      /**
       * How many page numbers can be visible without hiding any.
       * Includes the `currentPage`, as well as the first and last page,
       * plus twice the value of `padding`, which are pages on either side
       * of the `currentPage`.
       */
      const maxVisible = padding * 2 + 3;
      /**
       * Using this `threshold` rather than the explicit `padding`
       * creates a more natural UX feel as numbers are hidden.
       */
      const threshold = Math.floor(padding * 2 - padding / 2);
      /**
       * If we don't have to hide page numbers, we don't have to
       * hide page numbers. Simply return an ascending array of
       * numbers up to the given `totalPages`.
       */
      if (maxVisible >= totalPages) {
          return ascendingPageNumbers(totalPages);
      }
      /**
       * If the `currentPage` is below the `threshold`, pad ahead from the
       * current page by the value of `padding`, and then fill the array
       * until it is the appropriate length.
       */
      if (currentPage <= threshold) {
          const firstPages = ascendingPageNumbers(currentPage + padding);
          const lastPages = descendingPageNumbers(maxVisible - firstPages.length - 1, totalPages).reverse();
          return joinWithSeparator(firstPages, lastPages);
      }
      /**
       * Similarly, if the difference between the `currentPage` and `totalPages`
       * is below the threshold, pad backwards from `currentPage` by the value of
       * `padding`, and then fill the array.
       */
      if (currentPage >= totalPages - threshold) {
          const lastPages = descendingPageNumbers(totalPages + 1 - (currentPage - padding), totalPages);
          const firstPages = ascendingPageNumbers(maxVisible - lastPages.length);
          return joinWithSeparator(firstPages, lastPages);
      }
      /**
       * By default, pad around the `currentPage` by the value of `padding`,
       * and return this in between the first and last page with a separator
       * on each side.
       */
      const a = joinWithSeparator(1, ascendingPageNumbers(padding * 2 + 1, currentPage - padding), totalPages);
      return a;
  };

  var css_248z$E = i$6`:host{--border-color:var(--k-color-gray-modern-200)}.pagination{align-items:center;display:flex}.pagination.pagination--orientation-center{text-align:center}.pagination.pagination--orientation-left{text-align:left}.pagination.pagination--orientation-right{text-align:right}.pagination,.pagination__button-group,.pagination__page-count{display:flex;flex:1;justify-content:center;width:100%}.pagination__page-count{font-size:var(--k-font-size-sm)}.pagination--card{padding:12px 24px 16px}.pagination--card.pagination--variant-count,.pagination--card.pagination--variant-default{border-top:1px solid var(--border-color)}`;
  var styles$E = css_248z$E;
  styleInject(css_248z$E);

  /**
   * @element k-pagination
   */
  exports.Pagination = class Pagination extends KonstructElement {
      constructor() {
          super(...arguments);
          this.card = false;
          this.currentPage = 1;
          this.orientation = 'center';
          this.pagePadding = 2;
          this.theme = 'reversed';
          this.totalPages = 1;
          this.variant = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$E]; }
      get previousButton() {
          return x `<k-pagination-button ?card="${this.card}" theme="${this.theme}" type="${'previous'}" variant="${this.buttonVariant}"></k-pagination-button>`;
      }
      get nextButton() {
          return x `<k-pagination-button ?card="${this.card}" theme="${this.theme}" type="next" variant="${this.buttonVariant}"></k-pagination-button>`;
      }
      get pageCount() {
          const { currentPage, totalPages } = this;
          return x `<span class="pagination__page-count">${currentPage > totalPages ? totalPages : currentPage} of ${totalPages}</span>`;
      }
      get pageNumbers() {
          const { currentPage, pagePadding, totalPages } = this;
          return pageNumbers({
              currentPage,
              pagePadding,
              totalPages,
          });
      }
      get content() {
          switch (this.variant) {
              case 'count':
                  return this.renderCountVariant();
              case 'strip':
                  return this.renderStripVariant();
              case 'default':
              default:
                  return this.renderDefaultVariant();
          }
      }
      get cssClass() {
          const classes = [
              'pagination',
              `pagination--orientation-${this.orientation}`,
              `pagination--variant-${this.variant}`,
          ];
          if (this.card) {
              classes.push('pagination--card');
          }
          return classes.join(' ');
      }
      get pages() {
          return this.pageNumbers.map((value) => {
              if (value === PAGE_SEPARATOR) {
                  return x `<k-pagination-button theme="${this.theme}" type="separator" variant="${this.variant}"></k-pagination-button>`;
              }
              return x `<k-pagination-button ?current="${this.isCurrentPage(value)}" page="${value}" theme="${this.theme}" type="page" variant="${this.variant}"></k-pagination-button>`;
          });
      }
      get buttonVariant() {
          if (this.isCurrentVariant('strip')) {
              return 'strip';
          }
          return 'default';
      }
      isCurrentPage(page) {
          if (this.currentPage > this.totalPages) {
              return page === this.totalPages;
          }
          return page === this.currentPage;
      }
      isCurrentVariant(variant) {
          return variant === this.variant;
      }
      renderButtonGroup(content) {
          return x `<k-pagination-button-group ?card="${this.card}" class="pagination__button-group" theme="${this.theme}" variant="${this.buttonVariant}">${content}</k-pagination-button-group>`;
      }
      renderCountVariant() {
          switch (this.orientation) {
              case 'left':
                  return [this.pageCount, this.previousButton, this.nextButton];
              case 'right':
                  return [this.previousButton, this.nextButton, this.pageCount];
              case 'center':
              default:
                  return [this.previousButton, this.pageCount, this.nextButton];
          }
      }
      renderDefaultVariant() {
          switch (this.orientation) {
              case 'left':
                  return [
                      this.renderButtonGroup(this.pages),
                      this.previousButton,
                      this.nextButton,
                  ];
              case 'right':
                  return [
                      this.previousButton,
                      this.nextButton,
                      this.renderButtonGroup(this.pages),
                  ];
              case 'center':
              default:
                  return [
                      this.previousButton,
                      this.renderButtonGroup(this.pages),
                      this.nextButton,
                  ];
          }
      }
      renderStripVariant() {
          return this.renderButtonGroup([
              this.previousButton,
              ...this.pages,
              this.nextButton,
          ]);
      }
      render() {
          return x `<nav class="${this.cssClass}">${this.content}</nav>`;
      }
  };
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Pagination.prototype, "card", void 0);
  __decorate([
      n$5({
          attribute: 'current-page',
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.Pagination.prototype, "currentPage", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Pagination.prototype, "orientation", void 0);
  __decorate([
      n$5({
          attribute: 'page-padding',
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.Pagination.prototype, "pagePadding", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Pagination.prototype, "theme", void 0);
  __decorate([
      n$5({
          attribute: 'total-pages',
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.Pagination.prototype, "totalPages", void 0);
  __decorate([
      n$5({
          attribute: true,
          converter: (value) => {
              switch (value) {
                  case 'count':
                  case 'strip':
                      return value;
                  case 'default':
                  default:
                      return 'default';
              }
          },
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Pagination.prototype, "variant", void 0);
  exports.Pagination = __decorate([
      customElement('pagination')
  ], exports.Pagination);

  var css_248z$D = i$6`.pagination-button{align-items:center;background:0 0;border:none;color:var(--k-color-gray-900);display:inline-flex;height:40px;justify-content:center;min-width:40px;transition:all .1s ease-in-out}`;
  var styles$D = css_248z$D;
  styleInject(css_248z$D);

  /**
   * @element k-pagination-button
   *
   * @slot - The primary content, determined by `type`.
   * @slot leading - Prepend an element before the content.
   * @slot trailing - Append an element after the content.
   */
  exports.PaginationButton = class PaginationButton extends KonstructElement {
      constructor() {
          super(...arguments);
          this.current = false;
          this.theme = 'reversed';
          this.type = 'page';
          this.variant = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$D]; }
      get content() {
          switch (this.type) {
              case 'page':
                  return this.page;
              case 'next':
              case 'previous':
                  return capitalize$1(this.type);
              case 'separator':
                  return x `â€¦`; // ellipsis
              default:
                  return A;
          }
      }
      get leadingContent() {
          /** Only show the arrow on the `previous` button */
          if (!this.isType('previous')) {
              return A;
          }
          return x `<svg height="20" viewBox="0 0 20 20" width="20"><path d="M10 16.6666L3.33334 9.99998L10 3.33331L10.875 4.20831L5.70834 9.37498H16.6667V10.625H5.70834L10.875 15.7916L10 16.6666Z" fill="currentColor"/></svg>`;
      }
      get trailingContent() {
          /** Only show the arrow on the `next` button */
          if (!this.isType('next')) {
              return A;
          }
          return x `<svg height="20" viewBox="0 0 20 20" width="20"><path d="M10 16.6666L9.12504 15.7708L14.2709 10.625H3.33337V9.37498H14.2709L9.12504 4.22915L10 3.33331L16.6667 9.99998L10 16.6666Z" fill="currentColor"/></svg>`;
      }
      render() {
          const content = x `<slot class="pagination-button__leading" name="leading">${this.leadingContent}</slot><slot class="pagination-button__content">${this.content}</slot><slot class="pagination-button__trailing" name="trailing">${this.trailingContent}</slot>`;
          if (this.isType('separator')) {
              return x `<span class="pagination-separator" data-variant="${this.type}">${content}</span>`;
          }
          return x `<button class="pagination-button" ?data-current="${this.current}" data-type="${this.type}" data-variant="${this.variant}">${content}</button>`;
      }
      isType(type) {
          return type === this.type;
      }
  };
  __decorate([
      n$5({
          attribute: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.PaginationButton.prototype, "current", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: Number,
      }),
      __metadata("design:type", Number)
  ], exports.PaginationButton.prototype, "page", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.PaginationButton.prototype, "theme", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: 'String',
      }),
      __metadata("design:type", String)
  ], exports.PaginationButton.prototype, "type", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.PaginationButton.prototype, "variant", void 0);
  exports.PaginationButton = __decorate([
      customElement('pagination-button')
  ], exports.PaginationButton);

  var css_248z$C = i$6`.pagination-button-group{display:inline-flex}.pagination-button-group--variant-strip{background:var(--k-color-white);border-radius:6px;display:inline-flex;overflow:hidden}.pagination-button-group--variant-strip slot::slotted(*),.pagination-button-group--variant-strip slot>*{border-right:1px solid var(--k-color-gray-modern-100)}.pagination-button-group--variant-strip slot::slotted(:last-child),.pagination-button-group--variant-strip slot>:last-child{border-right:none}`;
  var styles$C = css_248z$C;
  styleInject(css_248z$C);

  /**
   * @element k-pagination-button-group
   */
  exports.PaginationButtonGroup = class PaginationButtonGroup extends exports.PaginationButton {
      static { this.styles = [KonstructElement.styles, styles$C]; }
      constructor() {
          super();
          this.addController(new SlotController(this, {
              forwardAttrs: ['theme', 'variant'],
              slots: 'default',
          }));
      }
      render() {
          return x `<div class="${`pagination-button-group pagination-button-group--variant-${this.variant}`}" data-variant="${this.variant}"><slot class="pagination-button-group__buttons"></slot></div>`;
      }
  };
  exports.PaginationButtonGroup = __decorate([
      customElement('pagination-button-group'),
      __metadata("design:paramtypes", [])
  ], exports.PaginationButtonGroup);

  var css_248z$B = i$6`:host([theme=default]){--k-payment-card-background-color:var(--k-color-kong);--k-payment-card-color:var(--k-color-white);--k-payment-card-strip-background-color:var(--k-color-gray-700);--k-payment-card-strip-color:var(--k-color-white)}:host([theme=dark]){--k-payment-card-background-color:var(--k-color-gray-700);--k-payment-card-color:var(--k-color-white);--k-payment-card-strip-background-color:var(--k-color-kong);--k-payment-card-strip-color:var(--k-color-white)}:host([theme=light]){--k-payment-card-background-color:var(--k-color-gray-100);--k-payment-card-color:var(--k-color-gray-700);--k-payment-card-strip-background-color:var(--k-color-gray-700);--k-payment-card-strip-color:var(--k-color-white)}:host([theme=transparent]){--k-payment-card-background-color:transparent;--k-payment-card-color:var(--k-color-white);--k-payment-card-strip-background-color:transparent;--k-payment-card-strip-color:var(--k-color-white)}.payment-card{background-color:var(--k-payment-card-background-color);border-radius:20px;box-shadow:8px 10px 16px rgba(0,0,0,.05);color:var(--k-payment-card-color);display:flex;height:190px;position:relative;width:316px}.payment-card__content{border-bottom-left-radius:20px;border-top-left-radius:20px;display:flex;flex-direction:column;height:100%;justify-content:space-between;overflow:hidden;padding:20px;width:calc(100% - 88px)}:host([strip=vertical]) .payment-card__content{background-color:var(--k-payment-card-strip-background-color);color:var(--k-payment-card-strip-color)}.payment-card__card-info{display:flex;flex-wrap:wrap;z-index:1}.payment-card__number{font-size:var(--k-font-size-md);font-weight:600;line-height:var(--k-line-height-md)}.payment-card__strip{background:var(--k-payment-card-strip-background-colorw);position:absolute;z-index:0}.payment-card__lines{background-position:0 40px;background-repeat:no-repeat;height:100%;left:0;opacity:.5;overflow:hidden;position:absolute;top:0;width:100%;z-index:0}`;
  var styles$B = css_248z$B;
  styleInject(css_248z$B);

  /**
   * A mock-up rendering of a payment card.
   *
   * @element k-payment-card
   *
   * @cssproperty --k-payment-card-background-color - Background color of the card
   * @cssproperty --k-payment-card-color - Text color of the card
   * @cssproperty --k-payment-card-strip-background-color - Background color of the strip
   * @cssproperty --k-payment-card-strip-color - Text color of the strip
   */
  exports.PaymentCard = class PaymentCard extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether to include a background gradient. */
          this.gradient = false;
          /** Whether to include the lines background image. */
          this.lines = false;
          /** The provider of the card. */
          this.provider = 'mastercard';
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$B]; }
      get formattedNumber() {
          return this.number
              ?.split('')
              .reduce((acc, val) => {
              const lastItem = acc[acc.length - 1] ?? '';
              if (lastItem.length === 4) {
                  return [...acc, val];
              }
              return [...acc.slice(0, acc.length - 1), `${lastItem}${val}`];
          }, [])
              .join(' ');
      }
      get backgroundImage() {
          if (!this.lines) {
              return A;
          }
          return x `<div class="payment-card__lines" style="${styleMap({
            backgroundImage: `url("${KONSTRUCT_ASSETS_PATH}/ui/payment-card/lines.svg")`,
            backgroundPosition: this.strip ? '0 8px' : '0 40px',
        })}"></div>`;
      }
      get payPassIcon() {
          return x `<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_1166_40872)"><path d="M15.143 1.28577C17.0237 4.54332 18.0139 8.23855 18.0139 12.0001C18.0139 15.7616 17.0237 19.4568 15.143 22.7143M10.4287 3.64291C11.8957 6.1838 12.668 9.06608 12.668 12.0001C12.668 14.934 11.8957 17.8163 10.4287 20.3572M5.92871 5.8072C6.98945 7.664 7.54789 9.77028 7.54789 11.9143C7.54789 14.0584 6.98945 16.1647 5.92871 18.0215M1.42871 8.14291C2.19318 9.29989 2.59847 10.6363 2.59847 12.0001C2.59847 13.3638 2.19318 14.7002 1.42871 15.8572" stroke="white" stroke-width="2.57143" stroke-linecap="round"/></g><defs><clipPath id="clip0_1166_40872"><rect width="20" height="24" fill="white"/></clipPath></defs></svg>`;
      }
      render() {
          return x `<div class="payment-card" data-strip="${l$2(this.strip)}" data-theme="${this.theme}">${this.backgroundImage}<div class="payment-card__content"><slot class="payment-card__company" name="company">${this.company}</slot><div class="payment-card__card-info"><div class="payment-card__card-info-row"><slot class="payment-card__cardholder" name="cardholder">${this.cardholder}</slot><slot class="payment-card__expiry" name="expiry">${this.expiry}</slot></div><div class="payment-card__card-info-row"><slot class="payment-card__number" name="number" style="${styleMap({ display: 'block !important' })}">${this.formattedNumber}</slot></div></div></div><div class="payment-card__col payment-card__col-right"><img alt="PayPass Icon" src="${`${KONSTRUCT_ASSETS_PATH}/ui/payment-card/pay-pass.svg`}"></div></div>`;
      }
  };
  __decorate([
      n$5({
          attribute: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.PaymentCard.prototype, "cardholder", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.PaymentCard.prototype, "company", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.PaymentCard.prototype, "expiry", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.PaymentCard.prototype, "gradient", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.PaymentCard.prototype, "lines", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.PaymentCard.prototype, "number", void 0);
  __decorate([
      n$5({
          attribute: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.PaymentCard.prototype, "provider", void 0);
  __decorate([
      n$5({
          attribute: true,
          converter: (val) => {
              switch (val) {
                  case null:
                  case 'horizontal':
                  case 'vertical':
                      return val;
                  default:
                      // always default to horizontal if any string value passed,
                      // allows the attribute to be used like a boolean
                      return 'horizontal';
              }
          },
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.PaymentCard.prototype, "strip", void 0);
  __decorate([
      n$5({
          attribute: true,
          converter: (val) => {
              switch (val) {
                  case null:
                  case 'light':
                  case 'dark':
                  case 'transparent':
                      return val;
                  case 'default':
                  default:
                      return 'default';
              }
          },
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.PaymentCard.prototype, "theme", void 0);
  exports.PaymentCard = __decorate([
      customElement('payment-card')
  ], exports.PaymentCard);

  var keycode$1 = {exports: {}};

  (function (module, exports) {
  	// Source: http://jsfiddle.net/vWx8V/
  	// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

  	/**
  	 * Conenience method returns corresponding value for given keyName or keyCode.
  	 *
  	 * @param {Mixed} keyCode {Number} or keyName {String}
  	 * @return {Mixed}
  	 * @api public
  	 */

  	function keyCode(searchInput) {
  	  // Keyboard Events
  	  if (searchInput && 'object' === typeof searchInput) {
  	    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode;
  	    if (hasKeyCode) searchInput = hasKeyCode;
  	  }

  	  // Numbers
  	  if ('number' === typeof searchInput) return names[searchInput]

  	  // Everything else (cast to string)
  	  var search = String(searchInput);

  	  // check codes
  	  var foundNamedKey = codes[search.toLowerCase()];
  	  if (foundNamedKey) return foundNamedKey

  	  // check aliases
  	  var foundNamedKey = aliases[search.toLowerCase()];
  	  if (foundNamedKey) return foundNamedKey

  	  // weird character?
  	  if (search.length === 1) return search.charCodeAt(0)

  	  return undefined
  	}

  	/**
  	 * Compares a keyboard event with a given keyCode or keyName.
  	 *
  	 * @param {Event} event Keyboard event that should be tested
  	 * @param {Mixed} keyCode {Number} or keyName {String}
  	 * @return {Boolean}
  	 * @api public
  	 */
  	keyCode.isEventKey = function isEventKey(event, nameOrCode) {
  	  if (event && 'object' === typeof event) {
  	    var keyCode = event.which || event.keyCode || event.charCode;
  	    if (keyCode === null || keyCode === undefined) { return false; }
  	    if (typeof nameOrCode === 'string') {
  	      // check codes
  	      var foundNamedKey = codes[nameOrCode.toLowerCase()];
  	      if (foundNamedKey) { return foundNamedKey === keyCode; }
  	    
  	      // check aliases
  	      var foundNamedKey = aliases[nameOrCode.toLowerCase()];
  	      if (foundNamedKey) { return foundNamedKey === keyCode; }
  	    } else if (typeof nameOrCode === 'number') {
  	      return nameOrCode === keyCode;
  	    }
  	    return false;
  	  }
  	};

  	exports = module.exports = keyCode;

  	/**
  	 * Get by name
  	 *
  	 *   exports.code['enter'] // => 13
  	 */

  	var codes = exports.code = exports.codes = {
  	  'backspace': 8,
  	  'tab': 9,
  	  'enter': 13,
  	  'shift': 16,
  	  'ctrl': 17,
  	  'alt': 18,
  	  'pause/break': 19,
  	  'caps lock': 20,
  	  'esc': 27,
  	  'space': 32,
  	  'page up': 33,
  	  'page down': 34,
  	  'end': 35,
  	  'home': 36,
  	  'left': 37,
  	  'up': 38,
  	  'right': 39,
  	  'down': 40,
  	  'insert': 45,
  	  'delete': 46,
  	  'command': 91,
  	  'left command': 91,
  	  'right command': 93,
  	  'numpad *': 106,
  	  'numpad +': 107,
  	  'numpad -': 109,
  	  'numpad .': 110,
  	  'numpad /': 111,
  	  'num lock': 144,
  	  'scroll lock': 145,
  	  'my computer': 182,
  	  'my calculator': 183,
  	  ';': 186,
  	  '=': 187,
  	  ',': 188,
  	  '-': 189,
  	  '.': 190,
  	  '/': 191,
  	  '`': 192,
  	  '[': 219,
  	  '\\': 220,
  	  ']': 221,
  	  "'": 222
  	};

  	// Helper aliases

  	var aliases = exports.aliases = {
  	  'windows': 91,
  	  'â‡§': 16,
  	  'âŒ¥': 18,
  	  'âŒƒ': 17,
  	  'âŒ˜': 91,
  	  'ctl': 17,
  	  'control': 17,
  	  'option': 18,
  	  'pause': 19,
  	  'break': 19,
  	  'caps': 20,
  	  'return': 13,
  	  'escape': 27,
  	  'spc': 32,
  	  'spacebar': 32,
  	  'pgup': 33,
  	  'pgdn': 34,
  	  'ins': 45,
  	  'del': 46,
  	  'cmd': 91
  	};

  	/*!
  	 * Programatically add the following
  	 */

  	// lower case chars
  	for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32;

  	// numbers
  	for (var i = 48; i < 58; i++) codes[i - 48] = i;

  	// function keys
  	for (i = 1; i < 13; i++) codes['f'+i] = i + 111;

  	// numpad keys
  	for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96;

  	/**
  	 * Get by code
  	 *
  	 *   exports.name[13] // => 'Enter'
  	 */

  	var names = exports.names = exports.title = {}; // title for backward compat

  	// Create reverse mapping
  	for (i in codes) names[codes[i]] = i;

  	// Add aliases
  	for (var alias in aliases) {
  	  codes[alias] = aliases[alias];
  	} 
  } (keycode$1, keycode$1.exports));

  var keycodeExports = keycode$1.exports;
  var keycode = /*@__PURE__*/getDefaultExportFromCjs(keycodeExports);

  var cardTypes$1 = {
      visa: {
          niceType: "Visa",
          type: "visa",
          patterns: [4],
          gaps: [4, 8, 12],
          lengths: [16, 18, 19],
          code: {
              name: "CVV",
              size: 3,
          },
      },
      mastercard: {
          niceType: "Mastercard",
          type: "mastercard",
          patterns: [[51, 55], [2221, 2229], [223, 229], [23, 26], [270, 271], 2720],
          gaps: [4, 8, 12],
          lengths: [16],
          code: {
              name: "CVC",
              size: 3,
          },
      },
      "american-express": {
          niceType: "American Express",
          type: "american-express",
          patterns: [34, 37],
          gaps: [4, 10],
          lengths: [15],
          code: {
              name: "CID",
              size: 4,
          },
      },
      "diners-club": {
          niceType: "Diners Club",
          type: "diners-club",
          patterns: [[300, 305], 36, 38, 39],
          gaps: [4, 10],
          lengths: [14, 16, 19],
          code: {
              name: "CVV",
              size: 3,
          },
      },
      discover: {
          niceType: "Discover",
          type: "discover",
          patterns: [6011, [644, 649], 65],
          gaps: [4, 8, 12],
          lengths: [16, 19],
          code: {
              name: "CID",
              size: 3,
          },
      },
      jcb: {
          niceType: "JCB",
          type: "jcb",
          patterns: [2131, 1800, [3528, 3589]],
          gaps: [4, 8, 12],
          lengths: [16, 17, 18, 19],
          code: {
              name: "CVV",
              size: 3,
          },
      },
      unionpay: {
          niceType: "UnionPay",
          type: "unionpay",
          patterns: [
              620,
              [624, 626],
              [62100, 62182],
              [62184, 62187],
              [62185, 62197],
              [62200, 62205],
              [622010, 622999],
              622018,
              [622019, 622999],
              [62207, 62209],
              [622126, 622925],
              [623, 626],
              6270,
              6272,
              6276,
              [627700, 627779],
              [627781, 627799],
              [6282, 6289],
              6291,
              6292,
              810,
              [8110, 8131],
              [8132, 8151],
              [8152, 8163],
              [8164, 8171],
          ],
          gaps: [4, 8, 12],
          lengths: [14, 15, 16, 17, 18, 19],
          code: {
              name: "CVN",
              size: 3,
          },
      },
      maestro: {
          niceType: "Maestro",
          type: "maestro",
          patterns: [
              493698,
              [500000, 504174],
              [504176, 506698],
              [506779, 508999],
              [56, 59],
              63,
              67,
              6,
          ],
          gaps: [4, 8, 12],
          lengths: [12, 13, 14, 15, 16, 17, 18, 19],
          code: {
              name: "CVC",
              size: 3,
          },
      },
      elo: {
          niceType: "Elo",
          type: "elo",
          patterns: [
              401178,
              401179,
              438935,
              457631,
              457632,
              431274,
              451416,
              457393,
              504175,
              [506699, 506778],
              [509000, 509999],
              627780,
              636297,
              636368,
              [650031, 650033],
              [650035, 650051],
              [650405, 650439],
              [650485, 650538],
              [650541, 650598],
              [650700, 650718],
              [650720, 650727],
              [650901, 650978],
              [651652, 651679],
              [655000, 655019],
              [655021, 655058],
          ],
          gaps: [4, 8, 12],
          lengths: [16],
          code: {
              name: "CVE",
              size: 3,
          },
      },
      mir: {
          niceType: "Mir",
          type: "mir",
          patterns: [[2200, 2204]],
          gaps: [4, 8, 12],
          lengths: [16, 17, 18, 19],
          code: {
              name: "CVP2",
              size: 3,
          },
      },
      hiper: {
          niceType: "Hiper",
          type: "hiper",
          patterns: [637095, 63737423, 63743358, 637568, 637599, 637609, 637612],
          gaps: [4, 8, 12],
          lengths: [16],
          code: {
              name: "CVC",
              size: 3,
          },
      },
      hipercard: {
          niceType: "Hipercard",
          type: "hipercard",
          patterns: [606282],
          gaps: [4, 8, 12],
          lengths: [16],
          code: {
              name: "CVC",
              size: 3,
          },
      },
  };
  var cardTypes_1 = cardTypes$1;

  var addMatchingCardsToResults$1 = {};

  var clone$1 = {};

  Object.defineProperty(clone$1, "__esModule", { value: true });
  clone$1.clone = void 0;
  function clone(originalObject) {
      if (!originalObject) {
          return null;
      }
      return JSON.parse(JSON.stringify(originalObject));
  }
  clone$1.clone = clone;

  var matches$1 = {};

  /*
   * Adapted from https://github.com/polvo-labs/card-type/blob/aaab11f80fa1939bccc8f24905a06ae3cd864356/src/cardType.js#L37-L42
   * */
  Object.defineProperty(matches$1, "__esModule", { value: true });
  matches$1.matches = void 0;
  function matchesRange(cardNumber, min, max) {
      var maxLengthToCheck = String(min).length;
      var substr = cardNumber.substr(0, maxLengthToCheck);
      var integerRepresentationOfCardNumber = parseInt(substr, 10);
      min = parseInt(String(min).substr(0, substr.length), 10);
      max = parseInt(String(max).substr(0, substr.length), 10);
      return (integerRepresentationOfCardNumber >= min &&
          integerRepresentationOfCardNumber <= max);
  }
  function matchesPattern(cardNumber, pattern) {
      pattern = String(pattern);
      return (pattern.substring(0, cardNumber.length) ===
          cardNumber.substring(0, pattern.length));
  }
  function matches(cardNumber, pattern) {
      if (Array.isArray(pattern)) {
          return matchesRange(cardNumber, pattern[0], pattern[1]);
      }
      return matchesPattern(cardNumber, pattern);
  }
  matches$1.matches = matches;

  Object.defineProperty(addMatchingCardsToResults$1, "__esModule", { value: true });
  addMatchingCardsToResults$1.addMatchingCardsToResults = void 0;
  var clone_1$1 = clone$1;
  var matches_1 = matches$1;
  function addMatchingCardsToResults(cardNumber, cardConfiguration, results) {
      var i, patternLength;
      for (i = 0; i < cardConfiguration.patterns.length; i++) {
          var pattern = cardConfiguration.patterns[i];
          if (!matches_1.matches(cardNumber, pattern)) {
              continue;
          }
          var clonedCardConfiguration = clone_1$1.clone(cardConfiguration);
          if (Array.isArray(pattern)) {
              patternLength = String(pattern[0]).length;
          }
          else {
              patternLength = String(pattern).length;
          }
          if (cardNumber.length >= patternLength) {
              clonedCardConfiguration.matchStrength = patternLength;
          }
          results.push(clonedCardConfiguration);
          break;
      }
  }
  addMatchingCardsToResults$1.addMatchingCardsToResults = addMatchingCardsToResults;

  var isValidInputType$1 = {};

  Object.defineProperty(isValidInputType$1, "__esModule", { value: true });
  isValidInputType$1.isValidInputType = void 0;
  function isValidInputType(cardNumber) {
      return typeof cardNumber === "string" || cardNumber instanceof String;
  }
  isValidInputType$1.isValidInputType = isValidInputType;

  var findBestMatch$1 = {};

  Object.defineProperty(findBestMatch$1, "__esModule", { value: true });
  findBestMatch$1.findBestMatch = void 0;
  function hasEnoughResultsToDetermineBestMatch(results) {
      var numberOfResultsWithMaxStrengthProperty = results.filter(function (result) { return result.matchStrength; }).length;
      /*
       * if all possible results have a maxStrength property that means the card
       * number is sufficiently long enough to determine conclusively what the card
       * type is
       * */
      return (numberOfResultsWithMaxStrengthProperty > 0 &&
          numberOfResultsWithMaxStrengthProperty === results.length);
  }
  function findBestMatch(results) {
      if (!hasEnoughResultsToDetermineBestMatch(results)) {
          return null;
      }
      return results.reduce(function (bestMatch, result) {
          if (!bestMatch) {
              return result;
          }
          /*
           * If the current best match pattern is less specific than this result, set
           * the result as the new best match
           * */
          if (Number(bestMatch.matchStrength) < Number(result.matchStrength)) {
              return result;
          }
          return bestMatch;
      });
  }
  findBestMatch$1.findBestMatch = findBestMatch;

  var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
      __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                  t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };
  var cardTypes = cardTypes_1;
  var add_matching_cards_to_results_1 = addMatchingCardsToResults$1;
  var is_valid_input_type_1 = isValidInputType$1;
  var find_best_match_1 = findBestMatch$1;
  var clone_1 = clone$1;
  var customCards = {};
  var cardNames = {
      VISA: "visa",
      MASTERCARD: "mastercard",
      AMERICAN_EXPRESS: "american-express",
      DINERS_CLUB: "diners-club",
      DISCOVER: "discover",
      JCB: "jcb",
      UNIONPAY: "unionpay",
      MAESTRO: "maestro",
      ELO: "elo",
      MIR: "mir",
      HIPER: "hiper",
      HIPERCARD: "hipercard",
  };
  var ORIGINAL_TEST_ORDER = [
      cardNames.VISA,
      cardNames.MASTERCARD,
      cardNames.AMERICAN_EXPRESS,
      cardNames.DINERS_CLUB,
      cardNames.DISCOVER,
      cardNames.JCB,
      cardNames.UNIONPAY,
      cardNames.MAESTRO,
      cardNames.ELO,
      cardNames.MIR,
      cardNames.HIPER,
      cardNames.HIPERCARD,
  ];
  var testOrder = clone_1.clone(ORIGINAL_TEST_ORDER);
  function findType(cardType) {
      return customCards[cardType] || cardTypes[cardType];
  }
  function getAllCardTypes() {
      return testOrder.map(function (cardType) { return clone_1.clone(findType(cardType)); });
  }
  function getCardPosition(name, ignoreErrorForNotExisting) {
      if (ignoreErrorForNotExisting === void 0) { ignoreErrorForNotExisting = false; }
      var position = testOrder.indexOf(name);
      if (!ignoreErrorForNotExisting && position === -1) {
          throw new Error('"' + name + '" is not a supported card type.');
      }
      return position;
  }
  function creditCardType(cardNumber) {
      var results = [];
      if (!is_valid_input_type_1.isValidInputType(cardNumber)) {
          return results;
      }
      if (cardNumber.length === 0) {
          return getAllCardTypes();
      }
      testOrder.forEach(function (cardType) {
          var cardConfiguration = findType(cardType);
          add_matching_cards_to_results_1.addMatchingCardsToResults(cardNumber, cardConfiguration, results);
      });
      var bestMatch = find_best_match_1.findBestMatch(results);
      if (bestMatch) {
          return [bestMatch];
      }
      return results;
  }
  creditCardType.getTypeInfo = function (cardType) {
      return clone_1.clone(findType(cardType));
  };
  creditCardType.removeCard = function (name) {
      var position = getCardPosition(name);
      testOrder.splice(position, 1);
  };
  creditCardType.addCard = function (config) {
      var existingCardPosition = getCardPosition(config.type, true);
      customCards[config.type] = config;
      if (existingCardPosition === -1) {
          testOrder.push(config.type);
      }
  };
  creditCardType.updateCard = function (cardType, updates) {
      var originalObject = customCards[cardType] || cardTypes[cardType];
      if (!originalObject) {
          throw new Error("\"" + cardType + "\" is not a recognized type. Use `addCard` instead.'");
      }
      if (updates.type && originalObject.type !== updates.type) {
          throw new Error("Cannot overwrite type parameter.");
      }
      var clonedCard = clone_1.clone(originalObject);
      clonedCard = __assign(__assign({}, clonedCard), updates);
      customCards[clonedCard.type] = clonedCard;
  };
  creditCardType.changeOrder = function (name, position) {
      var currentPosition = getCardPosition(name);
      testOrder.splice(currentPosition, 1);
      testOrder.splice(position, 0, name);
  };
  creditCardType.resetModifications = function () {
      testOrder = clone_1.clone(ORIGINAL_TEST_ORDER);
      customCards = {};
  };
  creditCardType.types = cardNames;
  var dist = creditCardType;

  var css_248z$A = i$6`.payment-input-field{display:flex}`;
  var styles$A = css_248z$A;
  styleInject(css_248z$A);

  exports.PaymentInputField = class PaymentInputField extends InputFieldBase {
      constructor() {
          super(...arguments);
          this.providers = [
              'american-express',
              'discover',
              'mastercard',
              'visa',
          ];
      }
      static { this.styles = [InputFieldBase.styles, styles$A]; }
      get gaps() {
          return this.typeInfo?.gaps ?? [];
      }
      get maxLength() {
          if (!this.typeInfo) {
              return undefined;
          }
          return Math.max(...this.typeInfo.lengths);
      }
      get typeInfo() {
          if (!this.provider) {
              return undefined;
          }
          return dist.getTypeInfo(this.provider);
      }
      firstUpdated(...params) {
          super.firstUpdated(...params);
          const provider = params[0].get('provider');
          if (provider && provider !== this.provider) {
              this.value = '';
          }
      }
      willUpdate(...params) {
          super.willUpdate(...params);
          const provider = params[0].get('provider');
          if (provider && provider !== this.provider) {
              this.value = '';
          }
      }
  };
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.PaymentInputField.prototype, "provider", void 0);
  __decorate([
      n$5({
          attribute: true,
          converter: (value) => (value ? value.split(',') : []),
          type: Array,
      }),
      __metadata("design:type", Array)
  ], exports.PaymentInputField.prototype, "providers", void 0);
  exports.PaymentInputField = __decorate([
      customElement('payment-input-field')
  ], exports.PaymentInputField);

  var css_248z$z = i$6``;
  var styles$z = css_248z$z;
  styleInject(css_248z$z);

  exports.PaymentCardField = class PaymentCardField extends exports.PaymentInputField {
      constructor() {
          super(...arguments);
          this.placeholder = 'Card number';
          this.formattedValue = '';
          this.isNumeric = (value) => {
              return /^\d+$/.test(value);
          };
          this.isNumericKey = (e) => {
              return this.isNumeric(e.key);
          };
      }
      static { this.styles = [exports.PaymentInputField.styles, styles$z]; }
      get content() {
          return x `<input ?disabled="${this.disabled}" ?error="${this.error}" .value="${this.formattedValue ?? ''}" @blur="${this.handleBlur}" @change="${this.handleKeyUp}" @focus="${this.handleFocus}" @keydown="${this.handleKeyDown}" @keyup="${this.handleKeyUp}" placeholder="${this.placeholder}" type="text"> <input ?disabled="${this.disabled}" ?error="${this.error}" value="${this.value}" @change="${this.handleChange}" name="${l$2(this.name)}" type="hidden">`;
      }
      get leadingContent() {
          const iconName = this.paymentMethodIconName;
          if (!iconName) {
              return A;
          }
          return x `<k-icon class="payment-card-field__icon" library="payment-method" name="${iconName}"></k-icon>`;
      }
      get paymentMethodIconName() {
          switch (this.provider) {
              case 'american-express':
                  return 'amex-sm';
              case 'discover':
                  return 'discover-sm';
              case 'mastercard':
                  return 'mastercard-sm';
              case 'visa':
                  return 'visa-sm';
              default:
                  return undefined;
          }
      }
      handleChange(e) {
          if (!(e.target instanceof HTMLInputElement)) {
              return;
          }
          this.formattedValue = this.formatValue(e.target.value);
          super.handleChange(e);
      }
      handleKeyDown(e) {
          if (!(e.target instanceof HTMLInputElement) || e.metaKey) {
              return;
          }
          if (!this.isValidKeyPress(e)) {
              e.preventDefault();
              return;
          }
          const maxLength = this.maxLength
              ? this.maxLength + this.gaps.length
              : undefined;
          if (maxLength &&
              e.target.value.length >= maxLength &&
              this.isNumeric(e.key)) {
              e.preventDefault();
          }
      }
      isValidKeyPress(e) {
          const keyCode = keycode(e.key);
          if (
          // is alphabetical key
          (keyCode > 64 && keyCode < 91) ||
              // is operand key (*, +, -, etc.)
              (keyCode > 105 && keyCode < 112) ||
              // is character key
              keyCode >= 186) {
              return false;
          }
          return true;
      }
      handleKeyUp(e) {
          if (!(e.target instanceof HTMLInputElement)) {
              return;
          }
          const maxLength = this.maxLength
              ? this.maxLength + this.gaps.length
              : undefined;
          if (maxLength && e.target.value.length > maxLength) {
              e.preventDefault();
          }
          const formattedValue = this.formatValue(e.target.value);
          this.formattedValue = formattedValue;
          this.value = formattedValue.replace(/\s/g, '');
      }
      formatValue(val = '') {
          const firstGap = this.gaps[0];
          // Remove all non-numeric characters.
          // Without this step, we would run the risk of duplicating spaces.
          const value = val.replace(/\s/g, '').slice(0, this.maxLength);
          if (typeof firstGap !== 'number' || value.length <= firstGap) {
              // When `maxLength` is set, we want to limit the value to that length.
              // When `maxLength` is `undefined`, `String.slice` will return the entire string.
              return value;
          }
          const parts = [];
          this.gaps.forEach((gap, index) => {
              const prevGap = this.gaps[index - 1] ?? 0;
              const part = value.slice(prevGap, gap);
              if (part.length > 0) {
                  parts.push(value.slice(prevGap, gap));
              }
          });
          // Will always be a number since we know `firstGap` is a number.
          const lastGap = this.gaps[this.gaps.length - 1];
          if (lastGap !== firstGap) {
              parts.push(value.slice(lastGap));
          }
          return parts.filter(this.isNumeric).join(' ');
      }
      firstUpdated(_changed) {
          if (_changed.get('provider')) {
              this.formattedValue = '';
              this.value = '';
          }
          super.firstUpdated(_changed);
      }
      updated(_changed) {
          super.update(_changed);
      }
  };
  __decorate([
      n$5({
          attribute: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.PaymentCardField.prototype, "placeholder", void 0);
  __decorate([
      n$5({
          reflect: true,
          state: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.PaymentCardField.prototype, "formattedValue", void 0);
  exports.PaymentCardField = __decorate([
      customElement('payment-card-field')
  ], exports.PaymentCardField);

  var css_248z$y = i$6`.payment-cvv-field{display:flex}`;
  var styles$y = css_248z$y;
  styleInject(css_248z$y);

  exports.PaymentCVVField = class PaymentCVVField extends exports.PaymentInputField {
      static { this.styles = [exports.PaymentInputField.styles, styles$y]; }
      get content() {
          return x `<input ?disabled="${this.disabled}" .value="${this.value}" @blur="${this.handleBlur}" @change="${this.handleChange}" @focus="${this.handleFocus}" class="payment-card-field" maxlength="${l$2(this.maxLength)}" type="password">`;
      }
      get maxLength() {
          return this.typeInfo?.code.size;
      }
  };
  exports.PaymentCVVField = __decorate([
      customElement('payment-cvv-field')
  ], exports.PaymentCVVField);

  const min = Math.min;
  const max = Math.max;
  const round = Math.round;
  const floor = Math.floor;
  const createCoords = v => ({
    x: v,
    y: v
  });
  const oppositeSideMap = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom'
  };
  const oppositeAlignmentMap = {
    start: 'end',
    end: 'start'
  };
  function evaluate(value, param) {
    return typeof value === 'function' ? value(param) : value;
  }
  function getSide(placement) {
    return placement.split('-')[0];
  }
  function getAlignment(placement) {
    return placement.split('-')[1];
  }
  function getOppositeAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }
  function getAxisLength(axis) {
    return axis === 'y' ? 'height' : 'width';
  }
  function getSideAxis(placement) {
    return ['top', 'bottom'].includes(getSide(placement)) ? 'y' : 'x';
  }
  function getAlignmentAxis(placement) {
    return getOppositeAxis(getSideAxis(placement));
  }
  function getAlignmentSides(placement, rects, rtl) {
    if (rtl === void 0) {
      rtl = false;
    }
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const length = getAxisLength(alignmentAxis);
    let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
    if (rects.reference[length] > rects.floating[length]) {
      mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
    }
    return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
  }
  function getExpandedPlacements(placement) {
    const oppositePlacement = getOppositePlacement(placement);
    return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
  }
  function getOppositeAlignmentPlacement(placement) {
    return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
  }
  function getSideList(side, isStart, rtl) {
    const lr = ['left', 'right'];
    const rl = ['right', 'left'];
    const tb = ['top', 'bottom'];
    const bt = ['bottom', 'top'];
    switch (side) {
      case 'top':
      case 'bottom':
        if (rtl) return isStart ? rl : lr;
        return isStart ? lr : rl;
      case 'left':
      case 'right':
        return isStart ? tb : bt;
      default:
        return [];
    }
  }
  function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
    const alignment = getAlignment(placement);
    let list = getSideList(getSide(placement), direction === 'start', rtl);
    if (alignment) {
      list = list.map(side => side + "-" + alignment);
      if (flipAlignment) {
        list = list.concat(list.map(getOppositeAlignmentPlacement));
      }
    }
    return list;
  }
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
  }
  function expandPaddingObject(padding) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...padding
    };
  }
  function getPaddingObject(padding) {
    return typeof padding !== 'number' ? expandPaddingObject(padding) : {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  function rectToClientRect(rect) {
    return {
      ...rect,
      top: rect.y,
      left: rect.x,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    };
  }

  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let {
      reference,
      floating
    } = _ref;
    const sideAxis = getSideAxis(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const alignLength = getAxisLength(alignmentAxis);
    const side = getSide(placement);
    const isVertical = sideAxis === 'y';
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
    let coords;
    switch (side) {
      case 'top':
        coords = {
          x: commonX,
          y: reference.y - floating.height
        };
        break;
      case 'bottom':
        coords = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;
      case 'right':
        coords = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;
      case 'left':
        coords = {
          x: reference.x - floating.width,
          y: commonY
        };
        break;
      default:
        coords = {
          x: reference.x,
          y: reference.y
        };
    }
    switch (getAlignment(placement)) {
      case 'start':
        coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case 'end':
        coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a reference element when it is given a certain positioning strategy.
   *
   * This export does not have any `platform` interface logic. You will need to
   * write one for the platform you are using Floating UI with.
   */
  const computePosition$1 = async (reference, floating, config) => {
    const {
      placement = 'bottom',
      strategy = 'absolute',
      middleware = [],
      platform
    } = config;
    const validMiddleware = middleware.filter(Boolean);
    const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
    let rects = await platform.getElementRects({
      reference,
      floating,
      strategy
    });
    let {
      x,
      y
    } = computeCoordsFromPlacement(rects, placement, rtl);
    let statefulPlacement = placement;
    let middlewareData = {};
    let resetCount = 0;
    for (let i = 0; i < validMiddleware.length; i++) {
      const {
        name,
        fn
      } = validMiddleware[i];
      const {
        x: nextX,
        y: nextY,
        data,
        reset
      } = await fn({
        x,
        y,
        initialPlacement: placement,
        placement: statefulPlacement,
        strategy,
        middlewareData,
        rects,
        platform,
        elements: {
          reference,
          floating
        }
      });
      x = nextX != null ? nextX : x;
      y = nextY != null ? nextY : y;
      middlewareData = {
        ...middlewareData,
        [name]: {
          ...middlewareData[name],
          ...data
        }
      };
      if (reset && resetCount <= 50) {
        resetCount++;
        if (typeof reset === 'object') {
          if (reset.placement) {
            statefulPlacement = reset.placement;
          }
          if (reset.rects) {
            rects = reset.rects === true ? await platform.getElementRects({
              reference,
              floating,
              strategy
            }) : reset.rects;
          }
          ({
            x,
            y
          } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
        }
        i = -1;
        continue;
      }
    }
    return {
      x,
      y,
      placement: statefulPlacement,
      strategy,
      middlewareData
    };
  };

  /**
   * Resolves with an object of overflow side offsets that determine how much the
   * element is overflowing a given clipping boundary on each side.
   * - positive = overflowing the boundary by that number of pixels
   * - negative = how many pixels left before it will overflow
   * - 0 = lies flush with the boundary
   * @see https://floating-ui.com/docs/detectOverflow
   */
  async function detectOverflow(state, options) {
    var _await$platform$isEle;
    if (options === void 0) {
      options = {};
    }
    const {
      x,
      y,
      platform,
      rects,
      elements,
      strategy
    } = state;
    const {
      boundary = 'clippingAncestors',
      rootBoundary = 'viewport',
      elementContext = 'floating',
      altBoundary = false,
      padding = 0
    } = evaluate(options, state);
    const paddingObject = getPaddingObject(padding);
    const altContext = elementContext === 'floating' ? 'reference' : 'floating';
    const element = elements[altBoundary ? altContext : elementContext];
    const clippingClientRect = rectToClientRect(await platform.getClippingRect({
      element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
      boundary,
      rootBoundary,
      strategy
    }));
    const rect = elementContext === 'floating' ? {
      ...rects.floating,
      x,
      y
    } : rects.reference;
    const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
    const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
      x: 1,
      y: 1
    } : {
      x: 1,
      y: 1
    };
    const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
      rect,
      offsetParent,
      strategy
    }) : rect);
    return {
      top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
      bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
      left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
      right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
    };
  }

  /**
   * Optimizes the visibility of the floating element by flipping the `placement`
   * in order to keep it in view when the preferred placement(s) will overflow the
   * clipping boundary. Alternative to `autoPlacement`.
   * @see https://floating-ui.com/docs/flip
   */
  const flip = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'flip',
      options,
      async fn(state) {
        var _middlewareData$flip;
        const {
          placement,
          middlewareData,
          rects,
          initialPlacement,
          platform,
          elements
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true,
          fallbackPlacements: specifiedFallbackPlacements,
          fallbackStrategy = 'bestFit',
          fallbackAxisSideDirection = 'none',
          flipAlignment = true,
          ...detectOverflowOptions
        } = evaluate(options, state);
        const side = getSide(placement);
        const isBasePlacement = getSide(initialPlacement) === initialPlacement;
        const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
        const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
        if (!specifiedFallbackPlacements && fallbackAxisSideDirection !== 'none') {
          fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
        }
        const placements = [initialPlacement, ...fallbackPlacements];
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const overflows = [];
        let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
        if (checkMainAxis) {
          overflows.push(overflow[side]);
        }
        if (checkCrossAxis) {
          const sides = getAlignmentSides(placement, rects, rtl);
          overflows.push(overflow[sides[0]], overflow[sides[1]]);
        }
        overflowsData = [...overflowsData, {
          placement,
          overflows
        }];

        // One or more sides is overflowing.
        if (!overflows.every(side => side <= 0)) {
          var _middlewareData$flip2, _overflowsData$filter;
          const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
          const nextPlacement = placements[nextIndex];
          if (nextPlacement) {
            // Try next placement and re-run the lifecycle.
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }

          // First, find the candidates that fit on the mainAxis side of overflow,
          // then find the placement that fits the best on the main crossAxis side.
          let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;

          // Otherwise fallback.
          if (!resetPlacement) {
            switch (fallbackStrategy) {
              case 'bestFit':
                {
                  var _overflowsData$map$so;
                  const placement = (_overflowsData$map$so = overflowsData.map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$map$so[0];
                  if (placement) {
                    resetPlacement = placement;
                  }
                  break;
                }
              case 'initialPlacement':
                resetPlacement = initialPlacement;
                break;
            }
          }
          if (placement !== resetPlacement) {
            return {
              reset: {
                placement: resetPlacement
              }
            };
          }
        }
        return {};
      }
    };
  };

  // For type backwards-compatibility, the `OffsetOptions` type was also
  // Derivable.
  async function convertValueToCoords(state, options) {
    const {
      placement,
      platform,
      elements
    } = state;
    const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
    const side = getSide(placement);
    const alignment = getAlignment(placement);
    const isVertical = getSideAxis(placement) === 'y';
    const mainAxisMulti = ['left', 'top'].includes(side) ? -1 : 1;
    const crossAxisMulti = rtl && isVertical ? -1 : 1;
    const rawValue = evaluate(options, state);

    // eslint-disable-next-line prefer-const
    let {
      mainAxis,
      crossAxis,
      alignmentAxis
    } = typeof rawValue === 'number' ? {
      mainAxis: rawValue,
      crossAxis: 0,
      alignmentAxis: null
    } : {
      mainAxis: 0,
      crossAxis: 0,
      alignmentAxis: null,
      ...rawValue
    };
    if (alignment && typeof alignmentAxis === 'number') {
      crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
    }
    return isVertical ? {
      x: crossAxis * crossAxisMulti,
      y: mainAxis * mainAxisMulti
    } : {
      x: mainAxis * mainAxisMulti,
      y: crossAxis * crossAxisMulti
    };
  }

  /**
   * Modifies the placement by translating the floating element along the
   * specified axes.
   * A number (shorthand for `mainAxis` or distance), or an axes configuration
   * object may be passed.
   * @see https://floating-ui.com/docs/offset
   */
  const offset = function (options) {
    if (options === void 0) {
      options = 0;
    }
    return {
      name: 'offset',
      options,
      async fn(state) {
        const {
          x,
          y
        } = state;
        const diffCoords = await convertValueToCoords(state, options);
        return {
          x: x + diffCoords.x,
          y: y + diffCoords.y,
          data: diffCoords
        };
      }
    };
  };

  function getNodeName(node) {
    if (isNode(node)) {
      return (node.nodeName || '').toLowerCase();
    }
    // Mocked nodes in testing environments may not be instances of Node. By
    // returning `#document` an infinite loop won't occur.
    // https://github.com/floating-ui/floating-ui/issues/2317
    return '#document';
  }
  function getWindow(node) {
    var _node$ownerDocument;
    return (node == null ? void 0 : (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
  }
  function getDocumentElement(node) {
    var _ref;
    return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
  }
  function isNode(value) {
    return value instanceof Node || value instanceof getWindow(value).Node;
  }
  function isElement(value) {
    return value instanceof Element || value instanceof getWindow(value).Element;
  }
  function isHTMLElement(value) {
    return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
  }
  function isShadowRoot(value) {
    // Browsers without `ShadowRoot` support.
    if (typeof ShadowRoot === 'undefined') {
      return false;
    }
    return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
  }
  function isOverflowElement(element) {
    const {
      overflow,
      overflowX,
      overflowY,
      display
    } = getComputedStyle$1(element);
    return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !['inline', 'contents'].includes(display);
  }
  function isTableElement(element) {
    return ['table', 'td', 'th'].includes(getNodeName(element));
  }
  function isContainingBlock(element) {
    const webkit = isWebKit();
    const css = getComputedStyle$1(element);

    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
    return css.transform !== 'none' || css.perspective !== 'none' || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || ['transform', 'perspective', 'filter'].some(value => (css.willChange || '').includes(value)) || ['paint', 'layout', 'strict', 'content'].some(value => (css.contain || '').includes(value));
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else {
        currentNode = getParentNode(currentNode);
      }
    }
    return null;
  }
  function isWebKit() {
    if (typeof CSS === 'undefined' || !CSS.supports) return false;
    return CSS.supports('-webkit-backdrop-filter', 'none');
  }
  function isLastTraversableNode(node) {
    return ['html', 'body', '#document'].includes(getNodeName(node));
  }
  function getComputedStyle$1(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }
    return {
      scrollLeft: element.pageXOffset,
      scrollTop: element.pageYOffset
    };
  }
  function getParentNode(node) {
    if (getNodeName(node) === 'html') {
      return node;
    }
    const result =
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot ||
    // DOM Element detected.
    node.parentNode ||
    // ShadowRoot detected.
    isShadowRoot(node) && node.host ||
    // Fallback.
    getDocumentElement(node);
    return isShadowRoot(result) ? result.host : result;
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      return node.ownerDocument ? node.ownerDocument.body : node.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list) {
    var _node$ownerDocument2;
    if (list === void 0) {
      list = [];
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor));
  }

  function getCssDimensions(element) {
    const css = getComputedStyle$1(element);
    // In testing environments, the `width` and `height` properties are empty
    // strings for SVG elements, returning NaN. Fallback to `0` in this case.
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    const hasOffset = isHTMLElement(element);
    const offsetWidth = hasOffset ? element.offsetWidth : width;
    const offsetHeight = hasOffset ? element.offsetHeight : height;
    const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
    if (shouldFallback) {
      width = offsetWidth;
      height = offsetHeight;
    }
    return {
      width,
      height,
      $: shouldFallback
    };
  }

  function unwrapElement(element) {
    return !isElement(element) ? element.contextElement : element;
  }

  function getScale(element) {
    const domElement = unwrapElement(element);
    if (!isHTMLElement(domElement)) {
      return createCoords(1);
    }
    const rect = domElement.getBoundingClientRect();
    const {
      width,
      height,
      $
    } = getCssDimensions(domElement);
    let x = ($ ? round(rect.width) : rect.width) / width;
    let y = ($ ? round(rect.height) : rect.height) / height;

    // 0, NaN, or Infinity should always fallback to 1.

    if (!x || !Number.isFinite(x)) {
      x = 1;
    }
    if (!y || !Number.isFinite(y)) {
      y = 1;
    }
    return {
      x,
      y
    };
  }

  const noOffsets = /*#__PURE__*/createCoords(0);
  function getVisualOffsets(element) {
    const win = getWindow(element);
    if (!isWebKit() || !win.visualViewport) {
      return noOffsets;
    }
    return {
      x: win.visualViewport.offsetLeft,
      y: win.visualViewport.offsetTop
    };
  }
  function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
      return false;
    }
    return isFixed;
  }

  function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = createCoords(1);
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element);
      }
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
      let currentIFrame = win.frameElement;
      while (currentIFrame && offsetParent && offsetWin !== win) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle$1(currentIFrame);
        const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += left;
        y += top;
        currentIFrame = getWindow(currentIFrame).frameElement;
      }
    }
    return rectToClientRect({
      width,
      height,
      x,
      y
    });
  }

  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let {
      rect,
      offsetParent,
      strategy
    } = _ref;
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    if (offsetParent === documentElement) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    let scale = createCoords(1);
    const offsets = createCoords(0);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== 'fixed') {
      if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
    };
  }

  function getClientRects(element) {
    return Array.from(element.getClientRects());
  }

  function getWindowScrollBarX(element) {
    // If <html> has a CSS width greater than the viewport, then this will be
    // incorrect for RTL.
    return getBoundingClientRect(getDocumentElement(element)).left + getNodeScroll(element).scrollLeft;
  }

  // Gets the entire size of the scrollable document area, even extending outside
  // of the `<html>` and `<body>` rect bounds if horizontally scrollable.
  function getDocumentRect(element) {
    const html = getDocumentElement(element);
    const scroll = getNodeScroll(element);
    const body = element.ownerDocument.body;
    const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
    const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
    let x = -scroll.scrollLeft + getWindowScrollBarX(element);
    const y = -scroll.scrollTop;
    if (getComputedStyle$1(body).direction === 'rtl') {
      x += max(html.clientWidth, body.clientWidth) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }

  function getViewportRect(element, strategy) {
    const win = getWindow(element);
    const html = getDocumentElement(element);
    const visualViewport = win.visualViewport;
    let width = html.clientWidth;
    let height = html.clientHeight;
    let x = 0;
    let y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      const visualViewportBased = isWebKit();
      if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x,
      y
    };
  }

  // Returns the inner client rect, subtracting scrollbars if present.
  function getInnerBoundingClientRect(element, strategy) {
    const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
    const top = clientRect.top + element.clientTop;
    const left = clientRect.left + element.clientLeft;
    const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
    const width = element.clientWidth * scale.x;
    const height = element.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return {
      width,
      height,
      x,
      y
    };
  }
  function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
    let rect;
    if (clippingAncestor === 'viewport') {
      rect = getViewportRect(element, strategy);
    } else if (clippingAncestor === 'document') {
      rect = getDocumentRect(getDocumentElement(element));
    } else if (isElement(clippingAncestor)) {
      rect = getInnerBoundingClientRect(clippingAncestor, strategy);
    } else {
      const visualOffsets = getVisualOffsets(element);
      rect = {
        ...clippingAncestor,
        x: clippingAncestor.x - visualOffsets.x,
        y: clippingAncestor.y - visualOffsets.y
      };
    }
    return rectToClientRect(rect);
  }
  function hasFixedPositionAncestor(element, stopNode) {
    const parentNode = getParentNode(element);
    if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
      return false;
    }
    return getComputedStyle$1(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
  }

  // A "clipping ancestor" is an `overflow` element with the characteristic of
  // clipping (or hiding) child elements. This returns all clipping ancestors
  // of the given element up the tree.
  function getClippingElementAncestors(element, cache) {
    const cachedResult = cache.get(element);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element).filter(el => isElement(el) && getNodeName(el) !== 'body');
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle$1(element).position === 'fixed';
    let currentNode = elementIsFixed ? getParentNode(element) : element;

    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle$1(currentNode);
      const currentNodeIsContaining = isContainingBlock(currentNode);
      if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
        currentContainingBlockComputedStyle = null;
      }
      const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && ['absolute', 'fixed'].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
      if (shouldDropCurrentNode) {
        // Drop non-containing blocks.
        result = result.filter(ancestor => ancestor !== currentNode);
      } else {
        // Record last containing block for next iteration.
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element, result);
    return result;
  }

  // Gets the maximum area that the element is visible in due to any number of
  // clipping ancestors.
  function getClippingRect(_ref) {
    let {
      element,
      boundary,
      rootBoundary,
      strategy
    } = _ref;
    const elementClippingAncestors = boundary === 'clippingAncestors' ? getClippingElementAncestors(element, this._c) : [].concat(boundary);
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
      const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
    return {
      width: clippingRect.right - clippingRect.left,
      height: clippingRect.bottom - clippingRect.top,
      x: clippingRect.left,
      y: clippingRect.top
    };
  }

  function getDimensions(element) {
    return getCssDimensions(element);
  }

  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const isFixed = strategy === 'fixed';
    const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    const offsets = createCoords(0);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isOffsetParentAnElement) {
        const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }

  function getTrueOffsetParent(element, polyfill) {
    if (!isHTMLElement(element) || getComputedStyle$1(element).position === 'fixed') {
      return null;
    }
    if (polyfill) {
      return polyfill(element);
    }
    return element.offsetParent;
  }

  // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.
  function getOffsetParent(element, polyfill) {
    const window = getWindow(element);
    if (!isHTMLElement(element)) {
      return window;
    }
    let offsetParent = getTrueOffsetParent(element, polyfill);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static' && !isContainingBlock(offsetParent))) {
      return window;
    }
    return offsetParent || getContainingBlock(element) || window;
  }

  const getElementRects = async function (_ref) {
    let {
      reference,
      floating,
      strategy
    } = _ref;
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    return {
      reference: getRectRelativeToOffsetParent(reference, await getOffsetParentFn(floating), strategy),
      floating: {
        x: 0,
        y: 0,
        ...(await getDimensionsFn(floating))
      }
    };
  };

  function isRTL(element) {
    return getComputedStyle$1(element).direction === 'rtl';
  }

  const platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement,
    getClippingRect,
    getOffsetParent,
    getElementRects,
    getClientRects,
    getDimensions,
    getScale,
    isElement,
    isRTL
  };

  // https://samthor.au/2021/observing-dom/
  function observeMove(element, onMove) {
    let io = null;
    let timeoutId;
    const root = getDocumentElement(element);
    function cleanup() {
      clearTimeout(timeoutId);
      io && io.disconnect();
      io = null;
    }
    function refresh(skip, threshold) {
      if (skip === void 0) {
        skip = false;
      }
      if (threshold === void 0) {
        threshold = 1;
      }
      cleanup();
      const {
        left,
        top,
        width,
        height
      } = element.getBoundingClientRect();
      if (!skip) {
        onMove();
      }
      if (!width || !height) {
        return;
      }
      const insetTop = floor(top);
      const insetRight = floor(root.clientWidth - (left + width));
      const insetBottom = floor(root.clientHeight - (top + height));
      const insetLeft = floor(left);
      const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
      const options = {
        rootMargin,
        threshold: max(0, min(1, threshold)) || 1
      };
      let isFirstUpdate = true;
      function handleObserve(entries) {
        const ratio = entries[0].intersectionRatio;
        if (ratio !== threshold) {
          if (!isFirstUpdate) {
            return refresh();
          }
          if (!ratio) {
            timeoutId = setTimeout(() => {
              refresh(false, 1e-7);
            }, 100);
          } else {
            refresh(false, ratio);
          }
        }
        isFirstUpdate = false;
      }

      // Older browsers don't support a `document` as the root and will throw an
      // error.
      try {
        io = new IntersectionObserver(handleObserve, {
          ...options,
          // Handle <iframe>s
          root: root.ownerDocument
        });
      } catch (e) {
        io = new IntersectionObserver(handleObserve, options);
      }
      io.observe(element);
    }
    refresh(true);
    return cleanup;
  }

  /**
   * Automatically updates the position of the floating element when necessary.
   * Should only be called when the floating element is mounted on the DOM or
   * visible on the screen.
   * @returns cleanup function that should be invoked when the floating element is
   * removed from the DOM or hidden from the screen.
   * @see https://floating-ui.com/docs/autoUpdate
   */
  function autoUpdate(reference, floating, update, options) {
    if (options === void 0) {
      options = {};
    }
    const {
      ancestorScroll = true,
      ancestorResize = true,
      elementResize = typeof ResizeObserver === 'function',
      layoutShift = typeof IntersectionObserver === 'function',
      animationFrame = false
    } = options;
    const referenceEl = unwrapElement(reference);
    const ancestors = ancestorScroll || ancestorResize ? [...(referenceEl ? getOverflowAncestors(referenceEl) : []), ...getOverflowAncestors(floating)] : [];
    ancestors.forEach(ancestor => {
      ancestorScroll && ancestor.addEventListener('scroll', update, {
        passive: true
      });
      ancestorResize && ancestor.addEventListener('resize', update);
    });
    const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
    let reobserveFrame = -1;
    let resizeObserver = null;
    if (elementResize) {
      resizeObserver = new ResizeObserver(_ref => {
        let [firstEntry] = _ref;
        if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
          // Prevent update loops when using the `size` middleware.
          // https://github.com/floating-ui/floating-ui/issues/1740
          resizeObserver.unobserve(floating);
          cancelAnimationFrame(reobserveFrame);
          reobserveFrame = requestAnimationFrame(() => {
            resizeObserver && resizeObserver.observe(floating);
          });
        }
        update();
      });
      if (referenceEl && !animationFrame) {
        resizeObserver.observe(referenceEl);
      }
      resizeObserver.observe(floating);
    }
    let frameId;
    let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
    if (animationFrame) {
      frameLoop();
    }
    function frameLoop() {
      const nextRefRect = getBoundingClientRect(reference);
      if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
        update();
      }
      prevRefRect = nextRefRect;
      frameId = requestAnimationFrame(frameLoop);
    }
    update();
    return () => {
      ancestors.forEach(ancestor => {
        ancestorScroll && ancestor.removeEventListener('scroll', update);
        ancestorResize && ancestor.removeEventListener('resize', update);
      });
      cleanupIo && cleanupIo();
      resizeObserver && resizeObserver.disconnect();
      resizeObserver = null;
      if (animationFrame) {
        cancelAnimationFrame(frameId);
      }
    };
  }

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a reference element when it is given a certain CSS positioning
   * strategy.
   */
  const computePosition = (reference, floating, options) => {
    // This caches the expensive `getClippingElementAncestors` function so that
    // multiple lifecycle resets re-use the same result. It only lives for a
    // single call. If other functions become expensive, we can add them as well.
    const cache = new Map();
    const mergedOptions = {
      platform,
      ...options
    };
    const platformWithCache = {
      ...mergedOptions.platform,
      _c: cache
    };
    return computePosition$1(reference, floating, {
      ...mergedOptions,
      platform: platformWithCache
    });
  };

  var css_248z$x = i$6`:host{display:contents}.popup{left:0;position:absolute;top:0;width:-moz-max-content;width:max-content;z-index:100}.popup:not(.popup--active){display:none}`;
  var styles$x = css_248z$x;
  styleInject(css_248z$x);

  /**
   * Popup is a utility which allows you to anchor a floating element
   *  next to another element, while making sure it stays in view optimally.
   *
   * @element k-popup
   *
   * @event k-reposition - Emitted after repositioning the popup.
   *
   * @slot - The popup content.
   * @slot anchor - The element you want to anchor the popup element to. You may
   *  also link an anchor that exists outside of the popup container by using the
   * `anchor` attribute with an element id.
   *
   * @csspart anchor - The anchor element container.
   * @csspart popup - The base element container.
   */
  exports.Popup = class Popup extends KonstructElement {
      constructor() {
          super(...arguments);
          this.active = false;
          /**
           * Represents the distance (gutter or margin) between the floating element
           * and the reference element.
           * @see {@link https://floating-ui.com/docs/offset#mainaxis|mainaxis}
           */
          this.distance = 0;
          /**
           * A visibility optimizer that changes the placement of the floating element
           * to keep it in view. By default, only the opposite placement is tried.
           * @see {@link https://floating-ui.com/docs/flip|flip}
           */
          this.flip = false;
          /**
           * This describes the virtual padding around the boundary to check for overflow.
           * @see {@link https://floating-ui.com/docs/detectOverflow#padding|padding}
           */
          this.flipPadding = 0;
          this.placement = 'top';
          /**
           * The axis that runs along the alignment of the floating element.
           * Represents the skidding between the floating element and the reference element.
           * @see {@link https://floating-ui.com/docs/offset#crossaxis|crossaxis}
           */
          this.skidding = 0;
          this.anchorEl = null;
      }
      static { this.styles = [KonstructElement.styles, styles$x]; }
      get middleware() {
          /**
           * FloatingUI middlewares are plain objects that modify the positioning
           * coordinates in some fashion, or provide useful data for the consumer to
           * use. They are order-dependent.
           * @see {@link https://floating-ui.com/docs/middleware|middleware}
           */
          const middlewares = [];
          /**
           * Offset middleware usually goes first.
           * @see {@link https://floating-ui.com/docs/offset|offset}
           */
          middlewares.push(offset({ crossAxis: this.skidding, mainAxis: this.distance }));
          /**
           * Flip middleware changes the placement of the floating element in order to
           * keep it in view. By default, only the opposite placement is tried.
           * @see {@link https://floating-ui.com/docs/flip|flip}
           */
          if (this.flip) {
              middlewares.push(flip({
                  padding: this.flipPadding,
              }));
          }
          return middlewares;
      }
      async connectedCallback() {
          super.connectedCallback();
          // Wait until the first update, then position
          await this.updateComplete;
          this.start();
      }
      disconnectedCallback() {
          this.stop();
      }
      render() {
          return x `<slot name="anchor" part="anchor" @slotchange="${this.handleAnchorChange}"></slot><div part="popup" class="${classMap({
            popup: true,
            'popup--active': this.active,
        })}"><slot></slot></div>`;
      }
      reposition() {
          if (!this.active || !this.anchorEl) {
              return;
          }
          computePosition(this.anchorEl, this.popup, {
              middleware: this.middleware,
              placement: this.placement,
          }).then(({ x, y }) => {
              Object.assign(this.popup.style, {
                  left: `${x}px`,
                  top: `${y}px`,
              });
          });
          /**
           * @todo Move to an `emit` method on a KonstructElement base class.
           */
          const event = new Event('konstruct-reposition', {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(event);
      }
      async updated(changedProps) {
          super.updated(changedProps);
          if (changedProps.has('active')) {
              if (this.active) {
                  this.start();
              }
              else {
                  this.stop();
              }
          }
          // Reposition when active
          if (this.active) {
              await this.updateComplete;
              this.reposition();
          }
      }
      async handleAnchorChange() {
          await this.stop();
          if (this.anchor && typeof this.anchor === 'string') {
              // An anchor id was given.
              const root = this.getRootNode();
              this.anchorEl = root.getElementById(this.anchor);
          }
          else if (this.anchor instanceof Element) {
              // Use the anchor's reference
              this.anchorEl = this.anchor;
          }
          else {
              // Look for an anchor slot
              this.anchorEl = this.querySelector('[slot="anchor"]');
          }
          /**
           * Use the first assigned element when the anchor is a slot, as positions
           * can't be calculated given their default display value of `contents`.
           * @see {@link https://hidde.blog/more-accessible-markup-with-display-contents/|display-contents}
           */
          if (this.anchorEl instanceof HTMLSlotElement) {
              this.anchorEl = this.anchorEl.assignedElements({
                  flatten: true,
              })[0];
          }
          // if (!this.anchorEl) {
          //   throw new Error(
          //     'No anchor was found. Please use the anchor slot, or specify a selector id in the anchor attribute.',
          //   );
          // }
          this.start();
      }
      start() {
          if (!this.anchorEl) {
              return;
          }
          this.cleanup = autoUpdate(this.anchorEl, this.popup, () => {
              this.reposition();
          });
      }
      async stop() {
          return new Promise((resolve) => {
              if (this.cleanup) {
                  this.cleanup();
                  this.cleanup = undefined;
                  requestAnimationFrame(() => resolve());
              }
              else {
                  resolve();
              }
          });
      }
  };
  __decorate([
      i$2('.popup'),
      __metadata("design:type", HTMLElement)
  ], exports.Popup.prototype, "popup", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Popup.prototype, "active", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", Object)
  ], exports.Popup.prototype, "anchor", void 0);
  __decorate([
      n$5({ type: Number }),
      __metadata("design:type", Object)
  ], exports.Popup.prototype, "distance", void 0);
  __decorate([
      n$5({ type: Boolean }),
      __metadata("design:type", Object)
  ], exports.Popup.prototype, "flip", void 0);
  __decorate([
      n$5({ attribute: 'flip-padding', type: Number }),
      __metadata("design:type", Object)
  ], exports.Popup.prototype, "flipPadding", void 0);
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", String)
  ], exports.Popup.prototype, "placement", void 0);
  __decorate([
      n$5({ type: Number }),
      __metadata("design:type", Object)
  ], exports.Popup.prototype, "skidding", void 0);
  exports.Popup = __decorate([
      customElement('popup')
  ], exports.Popup);

  var css_248z$w = i$6`:host{--track-width:2px;--track-color:var(--k-color-kong-12);--indicator-color:var(--k-color-kong);--speed:2s;box-sizing:border-box;display:inline-flex;height:1em;width:1em}.spinner{flex:1 1 auto;height:100%;width:100%}.spinner--theme-light{--track-color:var(--k-color-white-20);--indicator-color:var(--k-color-white)}.spinner--theme-dark{--track-color:var(--k-color-black-6);--indicator-color:var(--k-color-gray-900)}.spinner--theme-kong{--track-color:var(--k-color-kong-12);--indicator-color:var(--k-color-kong)}.spinner__indicator,.spinner__track{fill:none;stroke-width:var(--track-width);transform-origin:50% 50%}.spinner__track{stroke:var(--track-color);transform-origin:0 0}.spinner__indicator{stroke-dasharray:150% 75%;stroke-linecap:square;stroke:var(--indicator-color);animation:spin var(--speed) linear infinite}@keyframes spin{0%{stroke-dasharray:.01em,2.75em;transform:rotate(0)}50%{stroke-dasharray:1.375em,1.375em;transform:rotate(450deg)}to{stroke-dasharray:.01em,2.75em;transform:rotate(3turn)}}`;
  var styles$w = css_248z$w;
  styleInject(css_248z$w);

  /**
   * A spinner indicates the progress of an indeterminate operation.
   *
   * @element k-spinner
   *
   * @csspart base - The base element container.
   *
   * @cssproperty --indicator-color - The color of the spinner's indicator.
   * @cssproperty --speed - The time it takes for the spinner to complete one animation cycle.
   * @cssproperty --track-color - The color of the track.
   * @cssproperty --track-width - The width of the track.
   */
  exports.Spinner = class Spinner extends KonstructElement {
      constructor() {
          super(...arguments);
          /**
           * The aria-valuetext attribute defines the human-readable text alternative
           * of aria-valuenow for a range widget.
           */
          this.description = 'loading';
          /** The spinner's color theme. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$w]; }
      get motionStyles() {
          return styleMap({
              cx: '0.5em',
              cy: '0.5em',
              r: 'calc(0.5em - var(--track-width) / 2)',
          });
      }
      render() {
          return x `<svg aria-label="${this.description}" class="${classMap('spinner', `spinner--theme-${this.theme}`)}" part="base" role="progressbar"><circle class="spinner__track" style="${this.motionStyles}"></circle><circle class="spinner__indicator" style="${this.motionStyles}"></circle></svg>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.Spinner.prototype, "description", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Spinner.prototype, "theme", void 0);
  exports.Spinner = __decorate([
      customElement('spinner')
  ], exports.Spinner);

  var css_248z$v = i$6`:host{--spinner-flower-animation-duration:1s;--spinner-flower-color:var(--k-color-gray-900);box-sizing:border-box;display:inline-flex;height:1em;width:1em}.spinner-flower{color:var(--spinner-flower-color);flex:1 1 auto;height:100%;width:100%}.spinner-flower--theme-dark{--spinner-flower-color:var(--k-color-gray-900)}.spinner-flower--theme-light{--spinner-flower-color:var(--k-color-white)}.spinner-flower--theme-kong{--spinner-flower-color:var(--k-color-kong)}.spinner-flower path{animation-duration:var(--spinner-flower-animation-duration);animation-iteration-count:infinite;animation-name:spinner-flower-opacity;animation-timing-function:ease-in-out}.spinner-flower path:first-child{animation-delay:calc((var(--spinner-flower-animation-duration) - .08333s)*-1)}.spinner-flower path:nth-child(2){animation-delay:calc((var(--spinner-flower-animation-duration) - .16667s)*-1)}.spinner-flower path:nth-child(3){animation-delay:calc((var(--spinner-flower-animation-duration) - .25s)*-1)}.spinner-flower path:nth-child(4){animation-delay:calc((var(--spinner-flower-animation-duration) - .33333s)*-1)}.spinner-flower path:nth-child(5){animation-delay:calc((var(--spinner-flower-animation-duration) - .41667s)*-1)}.spinner-flower path:nth-child(6){animation-delay:calc((var(--spinner-flower-animation-duration) - .5s)*-1)}.spinner-flower path:nth-child(7){animation-delay:calc((var(--spinner-flower-animation-duration) - .58333s)*-1)}.spinner-flower path:nth-child(8){animation-delay:calc((var(--spinner-flower-animation-duration) - .66667s)*-1)}.spinner-flower path:nth-child(9){animation-delay:calc((var(--spinner-flower-animation-duration) - .75s)*-1)}.spinner-flower path:nth-child(10){animation-delay:calc((var(--spinner-flower-animation-duration) - .83333s)*-1)}.spinner-flower path:nth-child(11){animation-delay:calc((var(--spinner-flower-animation-duration) - .91667s)*-1)}.spinner-flower path:nth-child(12){animation-delay:calc((var(--spinner-flower-animation-duration) - 1s)*-1)}@keyframes spinner-flower-opacity{0%{opacity:.96}to{opacity:.08}}`;
  var styles$v = css_248z$v;
  styleInject(css_248z$v);

  /**
   * @element k-spinner-flower
   *
   * @csspart base - The component's base wrapper.
   */
  exports.SpinnerFlower = class SpinnerFlower extends KonstructElement {
      constructor() {
          super(...arguments);
          /**
           * The aria-valuetext attribute defines the human-readable text alternative
           * of aria-valuenow for a range widget.
           */
          this.description = 'loading';
          /** The theme to display the spinner-flower in. */
          this.theme = 'dark';
      }
      static { this.styles = [KonstructElement.styles, styles$v]; }
      render() {
          return x `<svg aria-label="${this.description}" class="${classMap('spinner-flower', `spinner-flower--theme-${this.theme}`)}" fill="none" part="base" role="progressbar" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M12.96 1C12.96 0.447715 12.5122 0 11.96 0C11.4077 0 10.96 0.447715 10.96 1V5C10.96 5.55228 11.4077 6 11.96 6C12.5122 6 12.96 5.55228 12.96 5V1Z" fill="currentColor"/><path d="M14.5765 5.43476C14.3004 5.91305 14.4643 6.52464 14.9426 6.80078C15.4209 7.07692 16.0325 6.91305 16.3086 6.43476L18.3086 2.97065C18.5847 2.49236 18.4209 1.88077 17.9426 1.60463C17.4643 1.32849 16.8527 1.49236 16.5765 1.97065L14.5765 5.43476Z" fill="currentColor"/><path d="M17.4957 7.61597C17.0174 7.89211 16.8535 8.5037 17.1296 8.982C17.4058 9.46029 18.0174 9.62416 18.4957 9.34802L21.9598 7.34802C22.4381 7.07188 22.6019 6.46029 22.3258 5.982C22.0496 5.5037 21.4381 5.33983 20.9598 5.61597L17.4957 7.61597Z" fill="currentColor"/><path d="M18.9199 10.96C18.3676 10.96 17.9199 11.4077 17.9199 11.96C17.9199 12.5123 18.3676 12.96 18.9199 12.96H22.9199C23.4722 12.96 23.9199 12.5123 23.9199 11.96C23.9199 11.4077 23.4722 10.96 22.9199 10.96H18.9199Z" fill="currentColor"/><path d="M18.4854 14.5759C18.0071 14.2998 17.3955 14.4637 17.1194 14.942C16.8432 15.4203 17.0071 16.0318 17.4854 16.308L20.9495 18.308C21.4278 18.5841 22.0394 18.4203 22.3155 17.942C22.5917 17.4637 22.4278 16.8521 21.9495 16.5759L18.4854 14.5759Z" fill="currentColor"/><path d="M16.3033 17.486C16.0272 17.0077 15.4156 16.8438 14.9373 17.1199C14.459 17.3961 14.2951 18.0077 14.5713 18.486L16.5713 21.9501C16.8474 22.4284 17.459 22.5922 17.9373 22.3161C18.4156 22.0399 18.5795 21.4284 18.3033 20.9501L16.3033 17.486Z" fill="currentColor"/><path d="M12.96 18.93C12.96 18.3777 12.5122 17.93 11.96 17.93C11.4077 17.93 10.96 18.3777 10.96 18.93V22.93C10.96 23.4823 11.4077 23.93 11.96 23.93C12.5122 23.93 12.96 23.4823 12.96 22.93V18.93Z" fill="currentColor"/><path d="M5.61609 20.9641C5.33995 21.4423 5.50383 22.0539 5.98212 22.3301C6.46041 22.6062 7.072 22.4423 7.34814 21.9641L9.34814 18.5C9.62429 18.0217 9.46041 17.4101 8.98212 17.1339C8.50383 16.8578 7.89224 17.0217 7.61609 17.5L5.61609 20.9641Z" fill="currentColor"/><path d="M1.96539 16.5767C1.4871 16.8528 1.32322 17.4644 1.59937 17.9427C1.87551 18.421 2.4871 18.5849 2.96539 18.3087L6.42949 16.3087C6.90779 16.0326 7.07166 15.421 6.79552 14.9427C6.51938 14.4644 5.90779 14.3005 5.42949 14.5767L1.96539 16.5767Z" fill="currentColor"/><path d="M1 10.96C0.447715 10.96 0 11.4077 0 11.96C0 12.5123 0.447715 12.96 1 12.96H5C5.55228 12.96 6 12.5123 6 11.96C6 11.4077 5.55228 10.96 5 10.96H1Z" fill="currentColor"/><path d="M2.96588 5.61664C2.48759 5.3405 1.876 5.50438 1.59985 5.98267C1.32371 6.46096 1.48759 7.07255 1.96588 7.34869L5.42998 9.34869C5.90827 9.62484 6.51986 9.46096 6.79601 8.98267C7.07215 8.50438 6.90827 7.89279 6.42998 7.61664L2.96588 5.61664Z" fill="currentColor"/><path d="M7.34387 1.96527C7.06772 1.48698 6.45613 1.3231 5.97784 1.59924C5.49955 1.87539 5.33567 2.48698 5.61182 2.96527L7.61182 6.42937C7.88796 6.90766 8.49955 7.07154 8.97784 6.7954C9.45613 6.51925 9.62001 5.90766 9.34387 5.42937L7.34387 1.96527Z" fill="currentColor"/></g></svg>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.SpinnerFlower.prototype, "description", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.SpinnerFlower.prototype, "theme", void 0);
  exports.SpinnerFlower = __decorate([
      customElement('spinner-flower')
  ], exports.SpinnerFlower);

  var css_248z$u = i$6`:host{display:block}:host(:focus) .search-result{background-color:var(--k-color-gray-50)!important}:host(:focus-visible){outline:0}:host(:not([aria-disabled=true])) .search-result{background-color:transparent;cursor:pointer}:host(:hover:not([aria-disabled=true])) .search-result,:host([tabindex="0"]) .search-result{background-color:var(--k-color-gray-50)}:host(:hover:not([aria-disabled=true])) .search-result .search-result__heading,:host(:hover:not([aria-disabled=true])) .search-result .search-result__subheading,:host([tabindex="0"]) .search-result .search-result__heading,:host([tabindex="0"]) .search-result .search-result__subheading{padding-left:1px}:host(:focus-visible) .search-result{outline:0}.search-result{align-items:center;border-style:none;color:inherit;display:flex;gap:11px;isolation:isolate;padding:0 12px;position:relative;text-align:left;text-decoration:none;width:100%}.search-result__content{align-items:center;border-bottom:1px solid var(--k-color-gray-50);display:flex;flex:1 0 0;gap:10px;padding:9px 0 6px}.search-result__heading{-webkit-line-clamp:1;-webkit-box-orient:vertical;display:-webkit-box;font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-semibold);line-height:var(--k-line-height-sm);overflow:hidden;width:100%}.search-result__heading,.search-result__subheading{transition:all var(--k-transition-x-fast) ease-in-out}.search-result__subheading{align-self:stretch;color:var(--k-color-gray-900);display:flex;flex-direction:column;font-size:var(--k-font-size-xs);font-weight:400;justify-content:center;line-height:var(--k-line-height-xs)}.search-result__subheading::slotted(*){margin-top:-4px}.search-result__text{align-items:flex-start;display:flex;flex:1 0 0;flex-direction:column;margin-top:-2px}`;
  var styles$u = css_248z$u;
  styleInject(css_248z$u);

  /**
   * @element k-search-result
   *
   * @csspart base - The component's base wrapper.
   * @csspart content - The content wrapper.
   * @csspart image - The image wrapper.
   * @csspart heading - The heading wrapper.
   * @csspart subheading - The subheading wrapper.
   */
  exports.SearchResult = class SearchResult extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Disables the result item. */
          this.disabled = false;
          /**
           * The button type. Please note the default is "button", and not "submit",
           * which is the default for native button elements.
           */
          this.type = 'button';
          this.hrefAttribute = i `href`;
      }
      static { this.styles = [KonstructElement.styles, styles$u]; }
      get isLink() {
          return this.href ? true : false;
      }
      get tag() {
          if (this.href) {
              return i `a`;
          }
          else {
              return i `button`;
          }
      }
      /**
       * Simulates a click on the button or anchor.
       */
      click() {
          this.searchResult.click();
      }
      connectedCallback() {
          super.connectedCallback();
          this.setAttribute('role', 'option');
          this.handleHostClick = this.handleHostClick.bind(this);
          this.addEventListener('click', this.handleHostClick);
      }
      disconnectedCallback() {
          super.disconnectedCallback();
          this.removeEventListener('click', this.handleHostClick);
      }
      updated(changedProperties) {
          if (changedProperties.has('disabled')) {
              this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
          }
      }
      render() {
          return n `
      <${this.tag}
        class=${classMap({
            'search-result': true,
            'search-result--disabled': this.disabled,
        })}
        ?disabled=${l$2(this.isLink ? undefined : this.disabled)}
        ${this.hrefAttribute}=${l$2(this.href)}
        part="base"
        target=${l$2(this.target)}
        type=${l$2(this.isLink ? undefined : this.type)}
      >
        <div
          class="search-result__content"
          part="content"
        >
          <slot
            class="search-result__image"
            name="image"
            part="image"
          ></slot>

          <div class="search-result__text">
            <slot
              class="search-result__heading"
              name="heading"
              part="heading"
            ></slot>
            <slot
              class="search-result__subheading"
              name="subheading"
              part="subheading"
            ></slot>
          </div>
        </div>
      </${this.tag}>
    `;
      }
      handleHostClick(event) {
          /**
           * If the button is disabled, prevent the click event from being dispatched.
           */
          if (this.disabled) {
              event.preventDefault();
              event.stopImmediatePropagation();
          }
      }
  };
  __decorate([
      i$2('.search-result'),
      __metadata("design:type", HTMLElement)
  ], exports.SearchResult.prototype, "searchResult", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.SearchResult.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.SearchResult.prototype, "href", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.SearchResult.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.SearchResult.prototype, "type", void 0);
  exports.SearchResult = __decorate([
      customElement('search-result')
  ], exports.SearchResult);

  var css_248z$t = i$6`:host{display:block;display:contents}.search-results{background:var(--k-color-white);box-shadow:var(--k-shadow-xxxl);display:flex;flex-direction:column;overflow:auto;overscroll-behavior:none;transform-origin:top}k-search-result:first-child::part(content){padding-top:12px}k-search-result:last-child::part(content){border-bottom:none;padding-bottom:12px}`;
  var styles$t = css_248z$t;
  styleInject(css_248z$t);

  /**
   * Search results contain a collection of search-result items
   *   to choose from.
   *
   * @element k-search-results
   *
   * @slot - The search results content, consisting of search-result items.
   *
   * @csspart base - The base element container.
   *
   * @event {{ item: SearchResult }} k-select - dispatched when a search
   *   result is selected.
   * @event {{ item: SearchResult }} k-focus - dispatched when a search
   *   result is focused.
   * @event k-close - dispatched for closing the results panel.
   */
  exports.SearchResults = class SearchResults extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$t]; }
      /**
       * @internal Gets the current search result item, which is the item that has
       * `tabindex="0"` within the roving tab index. The item may or may not
       * have focus, but for keyboard interaction purposes it's considered the
       * "active" item.
       */
      get currentItem() {
          return this.getAllItems().find((i) => i.getAttribute('tabindex') === '0');
      }
      /**
       * @internal Sets the current search result to the specified element. This sets
       * `tabindex="0"` on the target element and `tabindex="-1"` to all other
       * items. This method must be called prior to setting focus on a search result.
       */
      set currentItem(item) {
          const items = this.getAllItems();
          // Update tab indexes
          items.forEach((i) => {
              i.setAttribute('tabindex', i === item ? '0' : '-1');
          });
          const focusEvent = new CustomEvent(K_FOCUS_EVENT);
          this.dispatchEvent(focusEvent);
      }
      connectedCallback() {
          super.connectedCallback();
          this.setAttribute('role', 'listbox');
      }
      focusFirst() {
          const item = this.getAllItems()[0];
          if (item) {
              this.currentItem = item;
              item.focus();
          }
      }
      focusLast() {
          const items = this.getAllItems();
          const item = items[items.length - 1];
          if (item) {
              this.currentItem = item;
              item.focus();
          }
      }
      render() {
          return x `<slot class="${classMap({
            'search-results': true,
        })}" part="base" @slotchange="${this.handleSlotChange}" @click="${this.handleClick}" @keydown="${this.handleKeyDown}" @mousedown="${this.handleMouseDown}"></slot>`;
      }
      getAllItems() {
          return [...this.defaultSlot.assignedElements({ flatten: true })].filter((el) => {
              if (!this.isSearchResult(el)) {
                  return false;
              }
              return true;
          });
      }
      handleClick(event) {
          const target = event.target;
          const item = target.closest('k-search-result');
          if (!item || item.disabled) {
              return;
          }
          const selectEvent = new CustomEvent(K_SELECT_EVENT);
          this.dispatchEvent(selectEvent);
      }
      handleKeyDown(event) {
          const key = event.key.toLowerCase();
          if (key === 'enter') {
              event.preventDefault();
              /**
               * Run click handlers if the search result supports it.
               */
              this.currentItem?.click();
          }
          /**
           * When <space> is pressed, prevent scrolling.
           */
          if (key === ' ') {
              event.preventDefault();
          }
          /**
           * Move the selection with the up/down direction keys.
           */
          if (['arrowdown', 'arrowup', 'home', 'end', 'tab', 'escape'].includes(key)) {
              const items = this.getAllItems();
              let index = this.currentItem ? items.indexOf(this.currentItem) : 0;
              if (items.length > 0) {
                  event.preventDefault();
                  if (key === 'arrowdown' || (key == 'tab' && !event.shiftKey)) {
                      index++;
                  }
                  else if (key === 'arrowup' || (key == 'tab' && event.shiftKey)) {
                      index--;
                  }
                  else if (key === 'home') {
                      index = 0;
                  }
                  else if (key === 'end') {
                      index = items.length - 1;
                  }
                  else if (key === 'escape') {
                      // Dispatch k-close event
                      const closeEvent = new CustomEvent(K_CLOSE_EVENT, {
                          bubbles: true,
                          composed: true,
                      });
                      this.dispatchEvent(closeEvent);
                  }
                  if (index < 0) {
                      index = items.length - 1;
                  }
                  if (index > items.length - 1) {
                      index = 0;
                  }
                  const item = items[index];
                  this.currentItem = item;
                  item.focus();
              }
          }
      }
      handleMouseDown(event) {
          const target = event.target;
          if (this.isSearchResult(target)) {
              this.currentItem = target;
          }
      }
      handleSlotChange() {
          /**
           * When slotted items change, reset the index.
           */
          // const items = this.getAllItems();
          // if (items.length > 0) {
          //   this.currentItem = items[0] as SearchResult;
          // }
          const changeEvent = new CustomEvent(K_CHANGE_EVENT, {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(changeEvent);
      }
      isSearchResult(item) {
          return (item.tagName.toLowerCase() === 'k-search-result' ||
              ['menuitem', 'menuitemcheckbox', 'menuitemradio'].includes(item.getAttribute('role') ?? ''));
      }
  };
  __decorate([
      i$2('[part="base"]'),
      __metadata("design:type", HTMLElement)
  ], exports.SearchResults.prototype, "base", void 0);
  __decorate([
      i$2('slot'),
      __metadata("design:type", HTMLSlotElement)
  ], exports.SearchResults.prototype, "defaultSlot", void 0);
  exports.SearchResults = __decorate([
      customElement('search-results')
  ], exports.SearchResults);

  var css_248z$s = i$6`.search-button{--icon-size:16px;--size:26px;align-items:center;background:var(--background);border:none;border-radius:50%;color:var(--color);cursor:inherit;display:inline-flex;height:var(--size);justify-content:center;transition:width var(--k-transition-medium) ease-in-out,height var(--k-transition-medium) ease-in-out;width:var(--size)}.search-button--default{--background-active:var(--k-color-kong);--background-focus:var(--k-color-white);--background-pressed:var(--k-color-pressed-kong);--background:var(--k-color-white);--box-shadow:var(--k-focus-ring-kong-4);--color-active:var(--k-color-white);--color-focus:var(--k-color-gray-900);--color-pressed:var(--k-color-white);--color:var(--k-color-gray-900)}.search-button--reversed{--background-active:var(--k-color-kong);--background-focus:var(--k-color-gray-900);--background-pressed:var(--k-color-pressed-kong);--background:var(--k-color-gray-900);--box-shadow:var(--k-focus-ring-kong-4);--color-active:var(--k-color-white);--color-focus:var(--k-color-white);--color-pressed:var(--k-color-white);--color:var(--k-color-white)}.search-button--active{background:var(--background-active);color:var(--color-active)}.search-button--focused:not(:active):not(.search-button--active){color:var(--color-focus);outline:0}.search-button--focused:not(:active):not(.search-button--active):not(.search-button--active):not(.search-button--disabled){background:var(--background-focus);box-shadow:var(--box-shadow)}.search-button:active{background:var(--background-pressed);color:var(--color-pressed);outline:0}.search-button:hover:not(:disabled){cursor:pointer}.search-button--sm{--icon-size:20px;--size:32px}.search-button--sm.search-button--contained{--icon-size:16px;--size:26px}.search-button--md{--icon-size:22px;--size:40px}.search-button--md.search-button--contained{--icon-size:20px;--size:34px}.search-button--lg{--icon-size:30px;--size:48px}.search-button--lg.search-button--contained{--icon-size:24px;--size:40px}.search-button__icon{height:var(--icon-size);transition:width var(--k-transition-medium) ease-in-out,height var(--k-transition-medium) ease-in-out;width:var(--icon-size)}`;
  var styles$s = css_248z$s;
  styleInject(css_248z$s);

  /**
   * @element k-search-button
   *
   * @csspart base - The component's base wrapper.
   *
   * @event k-focus - Dispatched when the button is focused.
   * @event k-blur - Dispatched when the button is blurred.
   * @event k-select - Dispatched when the button is clicked.
   */
  exports.SearchButton = class SearchButton extends KonstructElement {
      constructor() {
          super(...arguments);
          this.active = false;
          this.contained = false;
          this.disabled = false;
          this.size = 'md';
          this.theme = 'reversed';
          /**
           * The button type, which defaults to "submit".
           */
          this.type = 'submit';
          this.hasFocus = false;
          /**
           * Necessary for form functionality to work (i.e: when using a submit button).
           *
           * We allow for undefined because the jest dom testing
           * environment does not include element internals.
           *
           * @see https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
           */
          this.internals = this.attachInternals?.();
      }
      static { this.styles = [KonstructElement.styles, styles$s]; }
      /** Necessary for form functionality to work when type = submit. */
      static { this.formAssociated = true; }
      get iconSize() {
          switch (this.size) {
              case 'sm':
                  return this.contained ? 16 : 20;
              case 'lg':
                  return this.contained ? 24 : 32;
              case 'md':
              default:
                  return this.contained ? 20 : 24;
          }
      }
      render() {
          return x `<button ?disabled="${this.disabled}" class="${classMap('search-button', {
            'search-button--active': this.active,
            'search-button--contained': this.contained,
            'search-button--disabled': this.disabled,
            'search-button--focused': this.hasFocus,
            [`search-button--${this.theme}`]: true,
            [`search-button--${this.size}`]: true,
        })}" part="base" type="${this.type}" @blur="${this.handleBlur}" @click="${this.handleClick}" @focus="${this.handleFocus}"><div class="sr-only">Submit</div><svg class="search-button__icon" fill="none" viewBox="0 0 32 32"><path d="M26.5 28.5L17.6333 19.6334C16.9889 20.1667 16.2222 20.5889 15.3333 20.9C14.4444 21.2111 13.5 21.3667 12.5 21.3667C9.98887 21.3667 7.87221 20.5 6.14998 18.7667C4.42776 17.0334 3.56665 14.9445 3.56665 12.5C3.56665 10.0556 4.43332 7.9667 6.16665 6.23336C7.89998 4.50003 9.98887 3.63336 12.4333 3.63336C14.9 3.63336 16.9889 4.50003 18.7 6.23336C20.4111 7.9667 21.2667 10.0556 21.2667 12.5C21.2667 13.4778 21.1222 14.4 20.8333 15.2667C20.5444 16.1334 20.1111 16.9556 19.5333 17.7334L28.4333 26.5667L26.5 28.5ZM12.4667 18.7C14.1778 18.7 15.6333 18.0945 16.8333 16.8834C18.0333 15.6723 18.6333 14.2111 18.6333 12.5C18.6333 10.7889 18.0333 9.32781 16.8333 8.1167C15.6333 6.90558 14.1778 6.30003 12.4667 6.30003C10.7111 6.30003 9.22776 6.90558 8.01665 8.1167C6.80554 9.32781 6.19998 10.7889 6.19998 12.5C6.19998 14.2111 6.80554 15.6723 8.01665 16.8834C9.22776 18.0945 10.7111 18.7 12.4667 18.7Z" fill="currentColor"/></svg></button>`;
      }
      handleBlur() {
          this.hasFocus = false;
          const blurEvent = new CustomEvent(K_BLUR_EVENT);
          this.dispatchEvent(blurEvent);
      }
      handleClick() {
          const clickEvent = new CustomEvent(K_SELECT_EVENT, {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(clickEvent);
          /** Attempts to submit the parent form (if any) when the button type is submit. */
          if (!this.disabled && this.type === 'submit') {
              this.internals?.form?.requestSubmit();
          }
      }
      handleFocus() {
          this.hasFocus = true;
          const focusEvent = new CustomEvent(K_FOCUS_EVENT);
          this.dispatchEvent(focusEvent);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.SearchButton.prototype, "active", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.SearchButton.prototype, "contained", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.SearchButton.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.SearchButton.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.SearchButton.prototype, "theme", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", String)
  ], exports.SearchButton.prototype, "type", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.SearchButton.prototype, "hasFocus", void 0);
  exports.SearchButton = __decorate([
      customElement('search-button')
  ], exports.SearchButton);

  class FormElement extends s$3 {
      constructor() {
          super(...arguments);
          this.disabled = false;
      }
  }
  class FormFieldController {
      constructor(host, ref) {
          this.host = host;
          this.ref = ref;
          this.host.addController(this);
      }
      hostConnected() {
          this.internals = this.internals
              ? this.internals
              : this.host.attachInternals?.();
      }
  }

  class FormCheckboxController extends FormFieldController {
      get checked() {
          return this.host.checked ?? false;
      }
      get value() {
          if (!this.checked) {
              return null;
          }
          if (this.host.value) {
              return String(this.host.value);
          }
          /** 'on' is the default value in forms for checkboxes. */
          return 'on';
      }
      hostUpdated() {
          this.updateFormValue();
      }
      /** Updates the form value. */
      updateFormValue() {
          this.internals?.setFormValue(this.value);
      }
  }

  class FormInputController extends FormFieldController {
      constructor(host, ref) {
          super(host, ref);
          this.handleInput = this.handleInput.bind(this);
      }
      /** Returns a formatted value that can be passed as an html attribute. */
      get formattedValue() {
          if (this.host.value === undefined) {
              return null;
          }
          if (typeof this.host.value === 'boolean') {
              return this.host.value ? '' : null;
          }
          if (this.host.value === '' ||
              this.host.value === null ||
              this.host.value === undefined) {
              return null;
          }
          return String(this.host.value);
      }
      hostConnected() {
          super.hostConnected();
          this.updateFormValue();
      }
      hostUpdated() {
          /** With the function bound in the constructor this will only be added once. */
          this.ref.value?.addEventListener('input', this.handleInput);
          this.updateFormValue();
      }
      /** Updates the form value. */
      updateFormValue() {
          this.internals?.setFormValue(this.formattedValue);
      }
      handleInput(e) {
          if (!(e.target instanceof HTMLInputElement) &&
              !(e.target instanceof HTMLTextAreaElement)) {
              return;
          }
          this.host.value = e.target.value;
      }
  }

  var css_248z$r = i$6`:host{display:flex}.form-textarea{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md);width:100%}.form-textarea__container{align-items:flex-start;background-color:var(--k-color-white);border:1px solid var(--k-color-gray-300);border-radius:var(--k-size-1-5);display:flex;min-height:40px;padding:var(--k-size-2) var(--k-size-4)}.form-field--disabled .form-textarea__container{border-style:dashed}.form-field--error .form-textarea__container{border-color:var(--k-color-error-500)!important}.form-field--focused .form-textarea__container{outline:1px solid var(--k-color-gray-900);outline-offset:-1px}.form-field--error.form-field--focused .form-textarea__container{outline:3px solid var(--k-color-error-500)}.form-textarea__container textarea{background:inherit;border:none;box-shadow:none;color:var(--k-color-gray-900);flex:1;font-family:var(--k-font-sans);font-size:var(--k-font-size-md);line-height:var(--k-line-height-md);max-width:100%;padding:0;resize:none;width:100%}.form-field--focused .form-textarea__container textarea,.form-textarea__container textarea:focus{outline:0}.form-textarea__container textarea::-moz-placeholder{color:var(--k-color-gray-500)}.form-textarea__container textarea::placeholder{color:var(--k-color-gray-500)}.form-textarea__label::slotted(*),.form-textarea__label>*{margin-bottom:var(--k-size-1)}.form-textarea__meta::slotted(*),.form-textarea__meta>*{margin-top:var(--k-size-1)}.form-textarea__leading,.form-textarea__trailing,.form-textarea__trailing__error{display:flex}.form-textarea__trailing__hint{cursor:help;display:flex}`;
  var styles$r = css_248z$r;
  styleInject(css_248z$r);

  exports.FormTextarea = class FormTextarea extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether the field is disabled. */
          this.disabled = false;
          /** The placeholder text for the input. */
          this.placeholder = '';
          /** The number of rows for the textarea. */
          this.rows = 3;
          /** The value of the form-textarea. */
          this.value = '';
          this.ref = e$1();
          this.focusController = new FocusController(this, this.ref);
          this.controller = new FormInputController(this, this.ref);
          this.hintRef = e$1();
          this.hintHoverController = new HoverController(this, this.hintRef);
      }
      static { this.styles = [KonstructElement.styles, styles$r]; }
      /** Required in order for the form to function natively. */
      static { this.formAssociated = true; }
      get focused() {
          return this.focusController.focused;
      }
      render() {
          return x `<div @click="${this.focusInput}" @focus="${this.focusInput}" @keydown="${this.focusInput}" class="${classMap('form-textarea', {
            'form-textarea--disabled': this.disabled,
            'form-textarea--error': this.error,
            'form-textarea--focused': this.focused,
        })}"><slot class="form-textarea__label" name="label">${n$2(this.label, () => x `<k-form-label label="${this.label}"></k-form-label>`)}</slot><div class="form-textarea__container"><slot class="form-textarea__leading" name="leading"></slot><textarea ?disabled="${this.disabled}" ?error="${this.error}" .value="${this.controller.formattedValue}" class="form-textarea__input" id="${l$2(this.name)}" name="${l$2(this.name)}" placeholder="${l$2(this.placeholder)}" rows="${this.rows}" ${n$3(this.ref)}></textarea><slot class="form-textarea__trailing" name="trailing">${this.renderTrailing()}</slot></div><slot class="form-textarea__meta" name="meta">${this.renderMeta()}</slot></div>`;
      }
      renderMeta() {
          if (this.error?.length) {
              return x `<k-form-error error="${this.error}"></k-form-error>`;
          }
          if (this.hint && this.hintHoverController.hovered) {
              return x `<k-form-hint hint="${this.hint}"></k-form-hint>`;
          }
          return A;
      }
      renderTrailing() {
          if (this.error) {
              return x `<span class="form-textarea__trailing__error"><k-form-error-icon></k-form-error-icon></span>`;
          }
          if (this.hint) {
              return x `<span class="form-textarea__trailing__hint" ${n$3(this.hintRef)}><k-form-hint-icon></k-form-hint-icon></span>`;
          }
          return A;
      }
      focusInput() {
          this.ref.value?.focus();
      }
  };
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormTextarea.prototype, "disabled", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormTextarea.prototype, "error", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormTextarea.prototype, "hint", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormTextarea.prototype, "label", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormTextarea.prototype, "name", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.FormTextarea.prototype, "placeholder", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.FormTextarea.prototype, "rows", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.FormTextarea.prototype, "value", void 0);
  exports.FormTextarea = __decorate([
      customElement('form-textarea')
  ], exports.FormTextarea);

  var css_248z$q = i$6`:host{display:flex}.form-select{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md);width:100%}.form-select__container{align-items:flex-start;background-color:var(--k-color-white);border:1px solid var(--k-color-gray-300);border-radius:var(--k-size-1-5);display:flex;justify-content:space-between;min-height:40px;overflow:hidden;padding-right:var(--k-size-4)}.form-field--disabled .form-select__container{border-style:dashed}.form-field--error .form-select__container{border-color:var(--k-color-error-500)!important}.form-field--focused .form-select__container{outline:1px solid var(--k-color-gray-900);outline-offset:-1px}.form-field--error.form-field--focused .form-select__container{outline:3px solid var(--k-color-error-500)}.form-select__container select{border:none;box-shadow:none;color:var(--k-color-gray-900);flex:1;font-family:var(--k-font-sans);font-size:var(--k-font-size-md);line-height:var(--k-line-height-md);max-width:100%;padding:var(--k-size-2) 0 var(--k-size-2) var(--k-size-4);width:100%}.form-field--focused .form-select__container select,.form-select__container select:focus{outline:0}.form-select__label::slotted(*),.form-select__label>*{margin-bottom:var(--k-size-1)}.form-select__meta::slotted(*),.form-select__meta>*{margin-top:var(--k-size-1)}.form-select__leading,.form-select__trailing{display:flex;flex:0}`;
  var styles$q = css_248z$q;
  styleInject(css_248z$q);

  exports.FormSelect = class FormSelect extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether the field is disabled. */
          this.disabled = false;
          /** The value of the form-select. */
          this.value = '';
          this.ref = e$1();
          this.focusController = new FocusController(this, this.ref);
          this.hintRef = e$1();
          this.hintHoverController = new HoverController(this, this.hintRef);
          /**
           * Necessary for form functionality to work.
           * @see https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
           */
          this.internals = this.attachInternals?.();
      }
      static { this.styles = [KonstructElement.styles, styles$q]; }
      /** Required in order for the form to function natively. */
      static { this.formAssociated = true; }
      get focused() {
          return this.focusController.focused;
      }
      render() {
          return x `<label class="${classMap('form-select', {
            'form-select--disabled': this.disabled,
            'form-select--error': this.error,
            'form-select--focused': this.focused,
        })}" for="${l$2(this.name)}"><slot class="form-select__label" name="label">${n$2(this.label, () => x `<k-form-label label="${this.label}"></k-form-label>`)}</slot><div class="form-select__container"><select @change="${this.handleChange}" ?disabled="${this.disabled}" ?error="${this.error}" .value="${this.value}" id="${l$2(this.name)}" name="${l$2(this.name)}" ${n$3(this.ref)}></select><slot @slotchange="${this.handleSlotChange}" style="display:none!important"></slot><slot class="form-select__trailing" name="trailing">${this.renderTrailing()}</slot></div><slot class="form-select__meta" name="meta">${this.renderMeta()}</slot></label>`;
      }
      willUpdate(...params) {
          super.willUpdate(...params);
          this.internals?.setFormValue(this.value);
      }
      renderMeta() {
          if (this.error?.length) {
              return x `<k-form-error error="${this.error}"></k-form-error>`;
          }
          if (this.hint && this.hintHoverController.hovered) {
              return x `<k-form-hint hint="${this.hint}"></k-form-hint>`;
          }
          return A;
      }
      renderTrailing() {
          if (this.error) {
              return x `<span class="form-select__trailing__error"><k-form-error-icon></k-form-error-icon></span>`;
          }
          if (this.hint) {
              return x `<span class="form-select__trailing__hint" ${n$3(this.hintRef)}><k-form-hint-icon></k-form-hint-icon></span>`;
          }
          return A;
      }
      handleChange(e) {
          if (!(e.target instanceof HTMLSelectElement)) {
              return;
          }
          this.value = e.target.value;
      }
      handleSlotChange(e) {
          if (!(e.target instanceof HTMLSlotElement)) {
              return;
          }
          const select = this.ref.value;
          select.innerHTML = '';
          e.target.assignedElements().forEach((el) => {
              if (el.getAttribute('value') === this.value) {
                  el.setAttribute('selected', '');
              }
              else {
                  el.removeAttribute('selected');
              }
              select.innerHTML += el.outerHTML;
          });
      }
  };
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormSelect.prototype, "disabled", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormSelect.prototype, "error", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormSelect.prototype, "hint", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormSelect.prototype, "label", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormSelect.prototype, "name", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.FormSelect.prototype, "value", void 0);
  exports.FormSelect = __decorate([
      customElement('form-select')
  ], exports.FormSelect);

  var css_248z$p = i$6`.form-radio__error{color:var(--k-color-error-500)}.form-radio__error,.form-radio__hint{display:flex;font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}.form-radio__hint{color:var(--k-color-gray-500)}.form-radio__label{color:var(--k-color-gray-900);display:flex;font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-medium);line-height:var(--k-line-height-sm)}:host{display:flex}.form-radio{align-items:flex-start;display:flex;gap:var(--k-size-2)}.form-radio__container{cursor:pointer;display:block;font-size:22px;height:16px;position:relative;-webkit-user-select:none;-moz-user-select:none;user-select:none;width:16px}.form-radio--md .form-radio__container{height:20px;width:20px}.form-radio__radio{background-color:var(--k-color-white);border-color:var(--k-color-gray-900);border-radius:50%;border-style:solid;border-width:1px;color:var(--k-color-gray-900);height:16px;left:0;position:absolute;top:0;width:16px}.form-radio__radio:after{background-color:currentColor;border-radius:50%;bottom:0;content:"";display:none;height:6px;left:0;margin:auto;position:absolute;right:0;top:0;width:6px}.form-radio--md .form-radio__radio{height:20px;width:20px}.form-radio--md .form-radio__radio:after{height:8px;width:8px}.form-radio--checked .form-radio__radio:after{display:block}.form-radio--disabled .form-radio__radio{background-color:var(--k-color-gray-100)!important;border-color:var(--k-color-gray-400)!important;color:var(--k-color-gray-400)!important;cursor:not-allowed}.form-radio--focused .form-radio__radio{border-color:transparent;box-shadow:var(--k-focus-ring-kong-4)}.form-radio__input{cursor:pointer;height:0;opacity:0;position:absolute;width:0}.form-radio--md .form-radio__label{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.form-radio--disabled .form-radio__label{color:var(--k-color-gray-500)}.form-radio--md .form-radio__hint{color:var(--k-color-gray-900);font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.form-radio--disabled .form-radio__hint{color:var(--k-color-gray-500)}.form-radio--md .form-radio__error{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}`;
  var styles$p = css_248z$p;
  styleInject(css_248z$p);

  /**
   * @element k-form-radio
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FormRadio = class FormRadio extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether the `form-radio` is checked or not. */
          this.checked = false;
          /** Whether the `form-radio` is disabled. */
          this.disabled = false;
          /** The size of the `form-radio`. */
          this.size = 'sm';
          this.radioRef = e$1();
          this.inputRef = e$1();
          this.focusController = new FocusController(this, this.inputRef);
          this.hoverController = new HoverController(this, this.radioRef);
          /**
           * Necessary for form functionality to work.
           * @see https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
           */
          this.internals = this.attachInternals?.();
      }
      static { this.styles = [KonstructElement.styles, styles$p]; }
      /**
       * Necessary for the form functionality to work.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals#examples
       */
      static { this.formAssociated = true; }
      render() {
          return x `<div class="${classMap('form-radio', `form-radio--${this.size}`, {
            'form-radio--checked': this.checked,
            'form-radio--disabled': this.disabled,
            'form-radio--focused': this.focusController.focused,
            'form-radio--hovered': this.hoverController.hovered,
        })}" part="base"><div class="form-radio__container"><input ?checked="${this.checked}" ?disabled="${this.disabled}" .value="${l$2(this.value)}" @click="${this.handleClickInput}" class="form-radio__input" name="${l$2(this.name)}" type="checkbox" ${n$3(this.inputRef)}> <span @click="${this.handleClickRadio}" @keydown="${this.handleClickRadio}" class="form-radio__radio" ${n$3(this.radioRef)}></span></div><div><slot name="label">${n$2(this.label, () => x `<label class="form-radio__label" for="${l$2(this.name)}">${this.label}</label>`)}</slot><slot name="meta">${this.renderMeta()}</slot></div></div>`;
      }
      updateFormValue() {
          /** 'on' is the default value in forms for radios. */
          this.internals?.setFormValue(this.checked ? this.value ?? 'on' : null);
      }
      willUpdate(...params) {
          super.willUpdate(...params);
          this.updateFormValue();
      }
      handleClickRadio() {
          this.inputRef.value?.click();
      }
      handleClickInput() {
          this.checked = true;
          /** I haven't found a better way to deselect other custom radio buttons. */
          document
              .querySelectorAll(`k-form-radio[name="${this.name}"]`)
              .forEach((el) => {
              if (el !== this) {
                  el.removeAttribute('checked');
              }
          });
      }
      renderMeta() {
          if (this.error) {
              return x `<span class="form-radio__error">${this.error}</span>`;
          }
          if (this.hint) {
              return x `<span class="form-radio__hint">${this.hint}</span>`;
          }
          return A;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormRadio.prototype, "checked", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormRadio.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormRadio.prototype, "error", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormRadio.prototype, "hint", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormRadio.prototype, "label", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormRadio.prototype, "name", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormRadio.prototype, "size", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormRadio.prototype, "value", void 0);
  exports.FormRadio = __decorate([
      customElement('form-radio')
  ], exports.FormRadio);

  var css_248z$o = i$6`.form-label{color:var(--k-color-gray-900);display:flex;font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-medium);line-height:var(--k-line-height-sm)}:host{display:flex}`;
  var styles$o = css_248z$o;
  styleInject(css_248z$o);

  /**
   * @element k-form-label
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FormLabel = class FormLabel extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$o]; }
      render() {
          return x `<label class="form-label" part="base"><slot>${this.label}</slot></label>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormLabel.prototype, "for", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormLabel.prototype, "label", void 0);
  exports.FormLabel = __decorate([
      customElement('form-label')
  ], exports.FormLabel);

  var css_248z$n = i$6`:host{display:flex}.form-input{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md);width:100%}.form-input__container{align-items:flex-start;background-color:var(--k-color-white);border:1px solid var(--k-color-gray-300);border-radius:var(--k-size-1-5);display:flex;min-height:40px;padding:var(--k-size-2) var(--k-size-4)}.form-input--disabled .form-input__container{border-style:dashed}.form-input--error .form-input__container{border-color:var(--k-color-error-500)!important}.form-input--focused .form-input__container{outline:1px solid var(--k-color-gray-900);outline-offset:-1px}.form-input--error.form-input--focused .form-input__container{outline:3px solid var(--k-color-error-500)}.form-input__container input{background:inherit;border:none;box-shadow:none;color:var(--k-color-gray-900);flex:1;font-family:var(--k-font-sans);font-size:var(--k-font-size-md);line-height:var(--k-line-height-md);max-width:100%;padding:0;width:100%}.form-input--focused .form-input__container input,.form-input__container input:focus{outline:0}.form-input__container input::-moz-placeholder{color:var(--k-color-gray-500)}.form-input__container input::placeholder{color:var(--k-color-gray-500)}.form-input__label::slotted(*),.form-input__label>*{margin-bottom:var(--k-size-1)}.form-input__meta::slotted(*),.form-input__meta>*{margin-top:var(--k-size-1)}.form-input__leading,.form-input__trailing,.form-input__trailing__error{display:flex}.form-input__trailing__hint{cursor:help;display:flex}`;
  var styles$n = css_248z$n;
  styleInject(css_248z$n);

  exports.FormInput = class FormInput extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether the field is disabled. */
          this.disabled = false;
          /** The placeholder text for the input. */
          this.placeholder = '';
          /** The type of the form input */
          this.type = 'text';
          /** The value of the form-input. */
          this.value = '';
          this.ref = e$1();
          this.focusController = new FocusController(this, this.ref);
          this.hintRef = e$1();
          this.hintHoverController = new HoverController(this, this.hintRef);
          this.controller = new FormInputController(this, this.ref);
      }
      static { this.styles = [KonstructElement.styles, styles$n]; }
      /** Required in order for the form to function natively. */
      static { this.formAssociated = true; }
      get focused() {
          return this.focusController.focused;
      }
      render() {
          return x `<div @click="${this.focusInput}" @focus="${this.focusInput}" @keydown="${this.focusInput}" class="${classMap('form-input', {
            'form-input--disabled': this.disabled,
            'form-input--error': this.error,
            'form-input--focused': this.focused,
        })}"><slot class="form-input__label" name="label">${n$2(this.label, () => x `<k-form-label label="${this.label}"></k-form-label>`)}</slot><div class="form-input__container"><slot class="form-input__leading" name="leading"></slot><input ?disabled="${this.disabled}" ?error="${this.error}" .value="${this.controller.formattedValue}" id="${l$2(this.name)}" name="${l$2(this.name)}" placeholder="${l$2(this.placeholder)}" type="${this.type}" ${n$3(this.ref)}><slot class="form-input__trailing" name="trailing">${this.renderTrailing()}</slot></div><slot class="form-input__meta" name="meta">${this.renderMeta()}</slot></div>`;
      }
      renderMeta() {
          if (this.error?.length) {
              return x `<k-form-error error="${this.error}"></k-form-error>`;
          }
          if (this.hint && this.hintHoverController.hovered) {
              return x `<k-form-hint hint="${this.hint}"></k-form-hint>`;
          }
          return A;
      }
      renderTrailing() {
          if (this.error) {
              return x `<span class="form-input__trailing__error"><k-form-error-icon></k-form-error-icon></span>`;
          }
          if (this.hint) {
              return x `<span class="form-input__trailing__hint" ${n$3(this.hintRef)}><k-form-hint-icon></k-form-hint-icon></span>`;
          }
          return A;
      }
      focusInput() {
          this.ref.value?.focus();
      }
  };
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormInput.prototype, "disabled", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormInput.prototype, "error", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormInput.prototype, "hint", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormInput.prototype, "label", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormInput.prototype, "name", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.FormInput.prototype, "placeholder", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormInput.prototype, "type", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.FormInput.prototype, "value", void 0);
  exports.FormInput = __decorate([
      customElement('form-input')
  ], exports.FormInput);

  var css_248z$m = i$6`.form-hint-icon{cursor:help}`;
  var styles$m = css_248z$m;
  styleInject(css_248z$m);

  /**
   * A form hint icon.
   *
   * @element k-form-hint-icon
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FormHintIcon = class FormHintIcon extends KonstructElement {
      constructor() {
          super(...arguments);
          this.icon = new SVGController(this, `${KONSTRUCT_ASSETS_PATH}/ui/forms/icons/hint.svg`, { class: 'form-hint-icon' });
      }
      static { this.styles = [KonstructElement.styles, styles$m]; }
      render() {
          return this.icon.render();
      }
  };
  exports.FormHintIcon = __decorate([
      customElement('form-hint-icon')
  ], exports.FormHintIcon);

  var css_248z$l = i$6`.form-hint{color:var(--k-color-gray-500);display:flex;font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}:host{display:flex}`;
  var styles$l = css_248z$l;
  styleInject(css_248z$l);

  /**
   * @element k-form-hint
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FormHint = class FormHint extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$l]; }
      render() {
          return x `<div class="form-hint" part="base"><slot>${this.hint}</slot></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormHint.prototype, "hint", void 0);
  exports.FormHint = __decorate([
      customElement('form-hint')
  ], exports.FormHint);

  const BYTE_UNITS = [
  	'B',
  	'kB',
  	'MB',
  	'GB',
  	'TB',
  	'PB',
  	'EB',
  	'ZB',
  	'YB',
  ];

  const BIBYTE_UNITS = [
  	'B',
  	'KiB',
  	'MiB',
  	'GiB',
  	'TiB',
  	'PiB',
  	'EiB',
  	'ZiB',
  	'YiB',
  ];

  const BIT_UNITS = [
  	'b',
  	'kbit',
  	'Mbit',
  	'Gbit',
  	'Tbit',
  	'Pbit',
  	'Ebit',
  	'Zbit',
  	'Ybit',
  ];

  const BIBIT_UNITS = [
  	'b',
  	'kibit',
  	'Mibit',
  	'Gibit',
  	'Tibit',
  	'Pibit',
  	'Eibit',
  	'Zibit',
  	'Yibit',
  ];

  /*
  Formats the given number using `Number#toLocaleString`.
  - If locale is a string, the value is expected to be a locale-key (for example: `de`).
  - If locale is true, the system default locale is used for translation.
  - If no value for locale is specified, the number is returned unmodified.
  */
  const toLocaleString = (number, locale, options) => {
  	let result = number;
  	if (typeof locale === 'string' || Array.isArray(locale)) {
  		result = number.toLocaleString(locale, options);
  	} else if (locale === true || options !== undefined) {
  		result = number.toLocaleString(undefined, options);
  	}

  	return result;
  };

  function prettyBytes(number, options) {
  	if (!Number.isFinite(number)) {
  		throw new TypeError(`Expected a finite number, got ${typeof number}: ${number}`);
  	}

  	options = {
  		bits: false,
  		binary: false,
  		space: true,
  		...options,
  	};

  	const UNITS = options.bits
  		? (options.binary ? BIBIT_UNITS : BIT_UNITS)
  		: (options.binary ? BIBYTE_UNITS : BYTE_UNITS);

  	const separator = options.space ? ' ' : '';

  	if (options.signed && number === 0) {
  		return ` 0${separator}${UNITS[0]}`;
  	}

  	const isNegative = number < 0;
  	const prefix = isNegative ? '-' : (options.signed ? '+' : '');

  	if (isNegative) {
  		number = -number;
  	}

  	let localeOptions;

  	if (options.minimumFractionDigits !== undefined) {
  		localeOptions = {minimumFractionDigits: options.minimumFractionDigits};
  	}

  	if (options.maximumFractionDigits !== undefined) {
  		localeOptions = {maximumFractionDigits: options.maximumFractionDigits, ...localeOptions};
  	}

  	if (number < 1) {
  		const numberString = toLocaleString(number, options.locale, localeOptions);
  		return prefix + numberString + separator + UNITS[0];
  	}

  	const exponent = Math.min(Math.floor(options.binary ? Math.log(number) / Math.log(1024) : Math.log10(number) / 3), UNITS.length - 1);
  	number /= (options.binary ? 1024 : 1000) ** exponent;

  	if (!localeOptions) {
  		number = number.toPrecision(3);
  	}

  	const numberString = toLocaleString(Number(number), options.locale, localeOptions);

  	const unit = UNITS[exponent];

  	return prefix + numberString + separator + unit;
  }

  var css_248z$k = i$6`:host{display:flex;width:100%}.form-file-input{align-items:center;background-color:var(--k-color-white);border-color:var(--k-color-gray-300);border-radius:var(--k-size-1-5);border-style:solid;border-width:1px;cursor:pointer;display:flex;flex-direction:column;padding:var(--k-size-6);width:100%}.form-file-input--hovered{background:var(--k-color-gray-50)}.form-file-input__input{height:0;position:absolute;width:0}.form-file-input__hint,.form-file-input__label{color:var(--k-color-gray-600);font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}.form-file-input__hint strong,.form-file-input__label strong{color:var(--k-color-gray-700)}`;
  var styles$k = css_248z$k;
  styleInject(css_248z$k);

  /**
   * @element k-form-file-input
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FormFileInput = class FormFileInput extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether the field is disabled. */
          this.disabled = false;
          /** The value of the form-input. */
          this.value = '';
          this.ref = e$1();
          this._files = null;
          /**
           * Necessary for form functionality to work.
           * @see https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
           */
          this.internals = this.attachInternals?.();
      }
      static { this.styles = [KonstructElement.styles, styles$k]; }
      /** Required in order for the form to function natively. */
      static { this.formAssociated = true; }
      get file() {
          return this.ref.value?.files?.[0] ?? null;
      }
      render() {
          return x `<label for="${l$2(this.name)}" class="form-file-input" part="base"><input @change="${this.handleChange}" ?disabled="${this.disabled}" .value="${l$2(this.value)}" accept="${l$2(this.accept)}" class="form-file-input__input" name="${l$2(this.name)}" type="file" value="${this.value}" ${n$3(this.ref)}> ${n$2(this.file, () => x `<span>${this.file?.name}</span> <span>${prettyBytes(this.file?.size ?? 0)}</span>`, () => x `<span class="form-file-input_label"><strong>Click to upload</strong></span><slot class="form-file-input__hint" name="hint">${n$2(this.hint, () => this.hint)}</slot>`)}</label>`;
      }
      handleChange() {
          this._files = this.ref.value?.files ?? null;
      }
      handleClickLabel() {
          this.ref.value?.click();
      }
      willUpdate(...params) {
          super.willUpdate(...params);
          this.internals?.setFormValue(this._files?.[0] ?? null);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormFileInput.prototype, "accept", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormFileInput.prototype, "disabled", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormFileInput.prototype, "error", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormFileInput.prototype, "hint", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormFileInput.prototype, "name", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.FormFileInput.prototype, "value", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.FormFileInput.prototype, "_files", void 0);
  exports.FormFileInput = __decorate([
      customElement('form-file-input')
  ], exports.FormFileInput);

  /**
   * A form error icon.
   *
   * @element k-form-error-icon
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FormErrorIcon = class FormErrorIcon extends KonstructElement {
      constructor() {
          super(...arguments);
          this.icon = new SVGController(this, `${KONSTRUCT_ASSETS_PATH}/ui/forms/icons/error.svg`, { class: 'form-error-icon' });
      }
      render() {
          return this.icon.render();
      }
  };
  exports.FormErrorIcon = __decorate([
      customElement('form-error-icon')
  ], exports.FormErrorIcon);

  var css_248z$j = i$6`.form-error{color:var(--k-color-error-500);display:flex;font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}:host{display:flex}`;
  var styles$j = css_248z$j;
  styleInject(css_248z$j);

  /**
   * @element k-form-error
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FormError = class FormError extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$j]; }
      render() {
          return x `<div class="form-error" part="base"><slot>${this.error}</slot></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormError.prototype, "error", void 0);
  exports.FormError = __decorate([
      customElement('form-error')
  ], exports.FormError);

  var css_248z$i = i$6`.form-checkbox__error{color:var(--k-color-error-500)}.form-checkbox__error,.form-checkbox__hint{display:flex;font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}.form-checkbox__hint{color:var(--k-color-gray-500)}.form-checkbox__label{color:var(--k-color-gray-900);display:flex;font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-medium);line-height:var(--k-line-height-sm)}:host{display:flex}.form-checkbox{align-items:flex-start;display:flex;gap:var(--k-size-2)}.form-checkbox__container{cursor:pointer;display:block;font-size:22px;height:16px;position:relative;-webkit-user-select:none;-moz-user-select:none;user-select:none;width:16px}.form-checkbox--md .form-checkbox__container{height:20px;width:20px}.form-checkbox__checkmark{background-color:var(--k-color-white);border-color:var(--k-color-gray-900);border-radius:2px;border-style:solid;border-width:1px;color:var(--k-color-gray-900);height:16px;left:0;margin-top:2px;position:absolute;top:0;width:16px}.form-checkbox__checkmark svg{display:none;height:auto;width:100%}.form-checkbox--md .form-checkbox__checkmark{height:20px;width:20px}.form-checkbox--checked .form-checkbox__checkmark svg{display:block}.form-checkbox--disabled .form-checkbox__checkmark{background-color:var(--k-color-gray-100)!important;border-color:var(--k-color-gray-400)!important;color:var(--k-color-gray-400)!important;cursor:not-allowed}.form-checkbox--checked:not(.form-checkbox--indeterminate) .form-checkbox__checkmark{background-color:var(--k-color-gray-900);color:var(--k-color-white)}.form-checkbox--checked.form-checkbox--hovered:not(.form-checkbox--indeterminate) .form-checkbox__checkmark{background-color:var(--k-color-gray-600);color:var(--k-color-white)}.form-checkbox--focused .form-checkbox__checkmark{border-color:transparent;box-shadow:var(--k-focus-ring-kong-4)}.form-checkbox__input{cursor:pointer;height:0;opacity:0;position:absolute;width:0}.form-checkbox--md .form-checkbox__label{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.form-checkbox--disabled .form-checkbox__label{color:var(--k-color-gray-500)}.form-checkbox__hint{color:var(--k-color-gray-900)}.form-checkbox--md .form-checkbox__hint{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.form-checkbox--disabled .form-checkbox__hint{color:var(--k-color-gray-500)}.form-checkbox--md .form-checkbox__error{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}`;
  var styles$i = css_248z$i;
  styleInject(css_248z$i);

  /**
   * @element k-form-checkbox
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FormCheckbox = class FormCheckbox extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether the `form-checkbox` is checked or not. */
          this.checked = false;
          /** Whether the `form-checkbox` is disabled. */
          this.disabled = false;
          /** When true, displays a minus icon instead of a checkmark when checked. */
          this.indeterminate = false;
          /** The size of the `form-checkbox`. */
          this.size = 'sm';
          this.checkmarkRef = e$1();
          this.inputRef = e$1();
          /** Controls the form functionality for the checkbox. */
          this.controller = new FormCheckboxController(this, this.inputRef);
          this.focusController = new FocusController(this, this.inputRef);
          this.hoverController = new HoverController(this, this.checkmarkRef);
      }
      static { this.styles = [KonstructElement.styles, styles$i]; }
      /**
       * Necessary for the form functionality to work.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals#examples
       */
      static { this.formAssociated = true; }
      render() {
          return x `<div class="${classMap('form-checkbox', `form-checkbox--${this.size}`, {
            'form-checkbox--checked': this.checked,
            'form-checkbox--disabled': this.disabled,
            'form-checkbox--focused': this.focusController.focused,
            'form-checkbox--hovered': this.hoverController.hovered,
            'form-checkbox--indeterminate': this.indeterminate,
        })}" part="base"><div class="form-checkbox__container"><input ?checked="${this.checked}" ?disabled="${this.disabled}" .value="${l$2(this.value)}" @click="${this.handleClickInput}" class="form-checkbox__input" name="${l$2(this.name)}" type="checkbox" ${n$3(this.inputRef)}> <span @click="${this.handleClickCheckmark}" @keydown="${this.handleClickCheckmark}" class="form-checkbox__checkmark" ${n$3(this.checkmarkRef)}>${n$2(this.indeterminate, () => x `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="#121926"/></svg>`, () => x `<svg fill="none" height="20" viewBox="0 0 20 20" width="20"><path d="M8.51242 13.7625L4.89575 10.1458L5.88742 9.15417L8.51242 11.7792L14.0978 6.19376L15.0895 7.18542L8.51242 13.7625Z" fill="currentColor"/></svg>`)}</span></div><div><slot name="label">${n$2(this.label, () => x `<label class="form-checkbox__label" for="${l$2(this.name)}">${this.label}</label>`)}</slot><slot name="meta">${this.renderMeta()}</slot></div></div>`;
      }
      toggleChecked() {
          this.checked = !this.checked;
      }
      handleClickCheckmark() {
          this.inputRef.value?.click();
      }
      handleClickInput() {
          this.toggleChecked();
      }
      renderMeta() {
          if (this.error) {
              return x `<span class="form-checkbox__error">${this.error}</span>`;
          }
          if (this.hint) {
              return x `<span class="form-checkbox__hint">${this.hint}</span>`;
          }
          return A;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormCheckbox.prototype, "checked", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormCheckbox.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormCheckbox.prototype, "error", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormCheckbox.prototype, "hint", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormCheckbox.prototype, "indeterminate", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormCheckbox.prototype, "label", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormCheckbox.prototype, "name", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormCheckbox.prototype, "size", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormCheckbox.prototype, "value", void 0);
  exports.FormCheckbox = __decorate([
      customElement('form-checkbox')
  ], exports.FormCheckbox);

  var css_248z$h = i$6`.form-toggle__error{color:var(--k-color-error-500)}.form-toggle__error,.form-toggle__hint{display:flex;font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}.form-toggle__hint{color:var(--k-color-gray-500)}.form-toggle__label{color:var(--k-color-gray-900);display:flex;font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-medium);line-height:var(--k-line-height-sm)}:host{display:flex}.form-toggle{align-items:flex-start;display:flex;gap:var(--k-size-2)}.form-toggle__container{cursor:pointer;display:block;font-size:22px;position:relative;-webkit-user-select:none;-moz-user-select:none;user-select:none}.form-toggle__toggle{background-color:var(--k-color-white);border:1px solid var(--k-color-gray-900);border-radius:12px;display:block;height:18px;position:relative;width:35px}.form-toggle__toggle:after{background-color:var(--k-color-gray-900);border-radius:50%;bottom:0;content:"";display:block;height:10px;left:4px;margin-bottom:auto;margin-top:auto;position:absolute;top:0;width:10px}.form-toggle--md .form-toggle__toggle{height:22px;width:44px}.form-toggle--md .form-toggle__toggle:after{height:14px;width:14px}.form-toggle--checked .form-toggle__toggle{background-color:var(--k-color-gray-900)}.form-toggle--checked .form-toggle__toggle:after{background-color:var(--k-color-white);left:unset;right:4px}.form-toggle--disabled .form-toggle__toggle{background-color:var(--k-color-gray-100)!important;border-color:var(--k-color-gray-400)!important;color:var(--k-color-gray-400)!important;cursor:not-allowed}.form-toggle--disabled .form-toggle__toggle:after{background-color:var(--k-color-gray-400)}.form-toggle__toggle .form-toggle--checked{background-color:var(--k-color-gray-900);color:var(--k-color-white)}.form-toggle--hovered:not(.form-toggle--checked) .form-toggle__toggle{border-color:var(--k-color-gray-600)}.form-toggle--hovered:not(.form-toggle--checked) .form-toggle__toggle:after{background-color:var(--k-color-gray-600)}.form-toggle--checked.form-toggle--hovered .form-toggle__toggle{background-color:var(--k-color-gray-600);color:var(--k-color-white)}.form-toggle--focused .form-toggle__toggle{border-color:transparent;box-shadow:var(--k-focus-ring-kong-4)}.form-toggle__input{cursor:pointer;height:0;opacity:0;position:absolute;width:0}.form-toggle--md .form-toggle__label{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.form-toggle--disabled .form-toggle__label{color:var(--k-color-gray-500)}.form-toggle__hint{color:var(--k-color-gray-900)}.form-toggle--md .form-toggle__hint{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.form-toggle--disabled .form-toggle__hint{color:var(--k-color-gray-500)}.form-toggle--md .form-toggle__error{font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}`;
  var styles$h = css_248z$h;
  styleInject(css_248z$h);

  /**
   * @element k-form-toggle
   *
   * @csspart base - The component's base wrapper.
   */
  exports.FormToggle = class FormToggle extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Whether the `form-toggle` is checked or not. */
          this.checked = false;
          /** Whether the `form-toggle` is disabled. */
          this.disabled = false;
          /** The size of the `form-toggle`. */
          this.size = 'sm';
          this.toggleRef = e$1();
          this.inputRef = e$1();
          /** Controls the form functionality for the toggle. */
          this.controller = new FormCheckboxController(this, this.inputRef);
          this.focusController = new FocusController(this, this.inputRef);
          this.hoverController = new HoverController(this, this.toggleRef);
      }
      static { this.styles = [KonstructElement.styles, styles$h]; }
      /**
       * Necessary for the form functionality to work.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals#examples
       */
      static { this.formAssociated = true; }
      render() {
          return x `<div class="${classMap('form-toggle', `form-toggle--${this.size}`, {
            'form-toggle--checked': this.checked,
            'form-toggle--disabled': this.disabled,
            'form-toggle--focused': this.focusController.focused,
            'form-toggle--hovered': this.hoverController.hovered,
        })}" part="base"><div class="form-toggle__container"><input ?checked="${this.checked}" ?disabled="${this.disabled}" .value="${l$2(this.value)}" @click="${this.handleClickInput}" class="form-toggle__input" name="${l$2(this.name)}" type="toggle" ${n$3(this.inputRef)}> <span @click="${this.handleClickCheckmark}" @keydown="${this.handleClickCheckmark}" class="form-toggle__toggle" ${n$3(this.toggleRef)}></span></div><div><slot name="label">${n$2(this.label, () => x `<label class="form-toggle__label" for="${l$2(this.name)}">${this.label}</label>`)}</slot><slot name="meta">${this.renderMeta()}</slot></div></div>`;
      }
      toggleChecked() {
          this.checked = !this.checked;
      }
      handleClickCheckmark() {
          this.inputRef.value?.click();
      }
      handleClickInput() {
          this.toggleChecked();
      }
      renderMeta() {
          if (this.error) {
              return x `<span class="form-toggle__error">${this.error}</span>`;
          }
          if (this.hint) {
              return x `<span class="form-toggle__hint">${this.hint}</span>`;
          }
          return A;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormToggle.prototype, "checked", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.FormToggle.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormToggle.prototype, "error", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormToggle.prototype, "hint", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormToggle.prototype, "label", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormToggle.prototype, "name", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormToggle.prototype, "size", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.FormToggle.prototype, "value", void 0);
  exports.FormToggle = __decorate([
      customElement('form-toggle')
  ], exports.FormToggle);

  var css_248z$g = i$6`:host{--search-bar-caret-color:var(--k-color-gray-900);--search-bar-caret-height:24px;--search-bar-caret-left:19px;--search-bar-caret-top:12px;--search-bar-caret-width:1px;--search-bar-gap:0;--search-bar-input-color:var(--k-color-gray-900);--search-bar-input-disabled-color:var(--k-color-gray-400);--search-bar-input-height:auto;--search-bar-input-padding:0;--search-bar-input-padding-focused:0;--search-bar-input-width:0;--search-bar-loading-spinner-size:24px;--search-bar-padding:0;--search-bar-placeholder-color:var(--k-color-gray-400);--search-bar-width:inherit;--easing-bounce:cubic-bezier(0.43,1.58,0.47,1.01);align-items:flex-start;display:flex;flex-direction:column;position:relative;width:100%}@keyframes blink{0%,to{opacity:1}50%{opacity:0}}.search-bar{align-items:stretch;background-color:transparent;border-radius:100px;cursor:text;display:inline-flex;gap:var(--search-bar-gap);isolation:isolate;justify-content:space-between;padding:var(--search-bar-padding);transition:all var(--k-transition-medium) var(--easing-bounce);vertical-align:middle;z-index:50}.search-bar:before{animation:none;background:var(--search-bar-caret-color);content:"";height:var(--search-bar-caret-height);left:var(--search-bar-caret-left);opacity:0;position:absolute;top:var(--search-bar-caret-top);width:var(--search-bar-caret-width)}.search-bar--active .search-bar__input-control{caret-color:var(--search-bar-caret-color);padding:var(--search-bar-input-padding-focused)}.search-bar--active:before{display:none}.search-bar--focused:before{animation:blink 1s step-end .25s infinite}.search-bar--focused .search-bar__input-control{padding:var(--search-bar-input-padding-focused)}.search-bar--active .search-bar__input-control{box-shadow:none!important;outline:0!important}.search-bar--closed.search-bar{--search-bar-gap:0;--search-bar-padding:0;width:var(--search-bar-input-height)}.search-bar--closed.search-bar .search-bar__input-control{padding:0;width:0}.search-bar--open{--search-bar-input-width:100%;--search-bar-padding:0 var(--search-bar-gap) 0 0;width:100%}.search-bar--open .search-bar__input-control{box-shadow:none;opacity:1;outline:0}.search-bar--open .search-bar__input-control:focus:not(:focus-visible){box-shadow:none;outline:0}.search-bar--open .search-bar__input-control:focus-visible{outline:0}.search-bar--sm{--search-bar-caret-height:16px;--search-bar-caret-left:14px;--search-bar-caret-top:8px;--search-bar-caret-width:1px;--search-bar-gap:3px;--search-bar-input-height:32px;--search-bar-input-padding-focused:3px 3px 4px 17px;--search-bar-input-padding:3px 3px 4px 12px;--search-bar-loading-spinner-size:18px;font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}.search-bar--md{--search-bar-caret-height:21px;--search-bar-caret-left:18px;--search-bar-caret-top:11px;--search-bar-caret-width:1px;--search-bar-gap:4px;--search-bar-input-height:42px;--search-bar-input-padding-focused:3px 0 3px 23px;--search-bar-input-padding:3px 0 3px 16px;--search-bar-loading-spinner-size:24px;font-size:var(--k-font-size-lg);line-height:var(--k-line-height-lg)}.search-bar--lg{--search-bar-caret-height:24px;--search-bar-caret-left:19px;--search-bar-caret-top:12px;--search-bar-caret-width:1px;--search-bar-gap:4px;--search-bar-input-height:48px;--search-bar-input-padding-focused:4px 0 5px 23px;--search-bar-input-padding:4px 0 5px 16px;--search-bar-loading-spinner-size:24px;font-size:var(--k-font-size-xl);line-height:var(--k-line-height-xl)}.search-bar--default.search-bar--open{background-color:var(--k-color-white)}.search-bar--reversed{--search-bar-caret-color:var(--k-color-white);--search-bar-input-color:var(--k-color-white);--search-bar-input-disabled-color:var(--k-color-gray-600);--search-bar-placeholder-color:var(--k-color-gray-500)}.search-bar--reversed.search-bar--open{background-color:var(--k-color-gray-900)}.search-bar--disabled .search-bar__button,.search-bar--disabled .search-bar__button::slotted(*){pointer-events:none}.search-bar__button{align-items:center;cursor:default;display:inline-flex;flex:0 0 auto;position:relative;transition:all var(--k-transition-medium) var(--easing-bounce)}.search-bar__controls{display:inline-flex}.search-bar__input-control{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:0 0;border:none;border-bottom-left-radius:calc(var(--search-bar-input-height)/2);border-bottom-right-radius:4px;border-top-left-radius:calc(var(--search-bar-input-height)/2);border-top-right-radius:4px;box-shadow:none;caret-color:transparent;cursor:inherit;flex:1 1 auto;font-family:inherit;font-size:inherit;font-weight:inherit;height:var(--search-bar-input-height);margin:0;min-width:0;opacity:0;overflow:hidden;padding:var(--search-bar-input-padding);position:relative;text-overflow:ellipsis;transition:all var(--k-transition-fast) var(--easing-bounce),padding var(--k-transition-medium) var(--easing-bounce);white-space:nowrap;width:var(--search-bar-input-width)}.search-bar__input-control::-moz-placeholder{color:var(--search-bar-placeholder-color);-moz-user-select:none;user-select:none}.search-bar__input-control::placeholder{color:var(--search-bar-placeholder-color);-webkit-user-select:none;-moz-user-select:none;user-select:none}.search-bar__loading{align-self:center;display:flex;position:relative;width:0}.search-bar__loading-spinner{display:flex;font-size:var(--search-bar-loading-spinner-size);opacity:0;transform:scale(.9);transition:opacity var(--k-transition-medium) linear,transform var(--k-transition-medium) var(--easing-bounce)}.search-bar--loading.search-bar--open.search-bar--loading .search-bar__loading{margin-right:8px;width:auto}.search-bar--loading.search-bar--open.search-bar--loading .search-bar__loading-spinner{opacity:1;transform:scale(1)}.search-bar:not(.search-bar--disabled) .search-bar__input-control{color:var(--search-bar-input-color)}.search-bar.search-bar--disabled .search-bar__input-control{color:var(--search-bar-input-disabled-color)}`;
  var styles$g = css_248z$g;
  styleInject(css_248z$g);

  let id$1 = 0;
  /**
   * @element k-search-bar
   *
   * @csspart base - The component's base wrapper.
   * @csspart button - The search button.
   * @csspart input - The input control.
   * @csspart results - The search results container.
   *
   * @event k-blur - Dispatched when the input loses focus.
   * @event k-change - Dispatched when the input value changes.
   * @event k-focus - Dispatched when the input gains focus.
   * @event k-input - Dispatched when the input receives a value.
   */
  exports.SearchBar = class SearchBar extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$g]; }
      /** Required in order for the form to function natively. */
      static { this.formAssociated = true; }
      constructor() {
          super();
          /** Disables the input. */
          this.disabled = false;
          /** Displays a loading indicator. */
          this.loading = false;
          /** The minimum length of input that will be considered valid. */
          this.minlength = undefined;
          /** The maximum length of input that will be considered valid. */
          this.maxlength = undefined;
          /** The form input's name. */
          this.name = '';
          /** Whether the search bar input is open or not. */
          this.open = false;
          /** Placeholder hint text when the input is empty. */
          this.placeholder = '';
          /** Makes the input a required field. */
          this.required = false;
          /** The search bar's size. */
          this.size = 'md';
          /** The search bar's theme. */
          this.theme = 'reversed';
          /** The value of the form-input. */
          this.value = '';
          this.hasFocus = false;
          this.isActive = false;
          this.showingResults = false;
          this.ref = e$1();
          this.searchBarNum = ++id$1;
          this.defaultInputId = `k-search-bar-${this.searchBarNum}-input`;
          this.defaultListboxId = `k-search-bar-${this.searchBarNum}-listbox`;
          this.controller = new FormInputController(this, this.ref);
          /** Controls the button slot to pass attrs based on the search bar's attrs */
          this.addController(new SlotController(this, {
              allow: [exports.SearchButton],
              setAttrs: () => ({
                  active: this.isActive,
                  contained: this.open,
                  disabled: this.disabled,
                  size: this.size,
                  theme: this.buttonTheme,
              }),
              slots: ['button'],
          }));
      }
      get buttonTheme() {
          switch (this.theme) {
              case 'default':
                  return 'reversed';
              default:
                  return 'default';
          }
      }
      get hasInput() {
          return this.input.value.trim().length > 0;
      }
      get loadingTheme() {
          switch (this.theme) {
              case 'reversed':
                  return 'light';
              default:
                  return 'dark';
          }
      }
      get results() {
          return this.resultsItems[0];
      }
      addShowingListeners() {
          document.addEventListener('mousedown', this.handleDocumentMouseDown);
          document.addEventListener(K_CLOSE_EVENT, this.handleResultsCloseEvent);
      }
      connectedCallback() {
          super.connectedCallback();
          this.handleDocumentMouseDown = this.handleDocumentMouseDown.bind(this);
          this.handleResultsChangeEvent = this.handleResultsChangeEvent.bind(this);
          this.handleResultsCloseEvent = this.handleResultsCloseEvent.bind(this);
          this.handleShowingResultsChange =
              this.handleShowingResultsChange.bind(this);
          document.addEventListener(K_CHANGE_EVENT, this.handleResultsChangeEvent);
      }
      removeShowingListeners() {
          document.removeEventListener('mousedown', this.handleDocumentMouseDown);
          document.removeEventListener(K_CLOSE_EVENT, this.handleResultsCloseEvent);
      }
      render() {
          return x `<k-popup ?active="${this.showingResults}" distance="16" flip-padding="0" placement="bottom"><div class="${classMap('search-bar', `search-bar--${this.theme}`, `search-bar--${this.size}`, {
            'search-bar--active': this.isActive,
            'search-bar--closed': !this.open,
            'search-bar--disabled': this.disabled,
            'search-bar--focused': this.hasFocus,
            'search-bar--loading': this.loading,
            'search-bar--open': this.open,
        })}" part="base" slot="anchor"><label for="${this.componentId}" class="sr-only">Search</label> <input .value="${this.controller.formattedValue}" ?disabled="${this.disabled || !this.open}" ?required="${this.required}" aria-autocomplete="list" aria-controls="${this.defaultListboxId}" aria-expanded="${this.open ? 'true' : 'false'}" aria-label="${this.name ?? 'Search'}" autocomplete="off" class="search-bar__input-control" id="${this.componentId}" minlength="${l$2(this.minlength)}" maxlength="${l$2(this.maxlength)}" name="${l$2(this.name)}" part="input" placeholder="${l$2(this.placeholder)}" role="combobox" @focus="${this.handleFocus}" @blur="${this.handleBlur}" @change="${this.handleChange}" @input="${this.handleInput}" @keydown="${this.handleKeyDown}" ${n$3(this.ref)}><div class="search-bar__controls"><div class="search-bar__loading"><k-spinner-flower class="search-bar__loading-spinner" description="Search results are loading" theme="${this.loadingTheme}"></k-spinner-flower></div><slot class="search-bar__button" name="button"></slot></div></div><slot class="${classMap({
            'search-bar__results': true,
            'search-bar__results--open': this.showingResults,
        })}" name="results" part="results"></slot></k-popup>`;
      }
      updated(changedProperties) {
          if (changedProperties.has('open')) {
              this.handleOpenChange();
          }
          if (changedProperties.has('showingResults')) {
              this.handleShowingResultsChange();
          }
      }
      handleBlur() {
          this.hasFocus = false;
          const blurEvent = new CustomEvent(K_BLUR_EVENT);
          this.dispatchEvent(blurEvent);
      }
      handleChange() {
          const changeEvent = new CustomEvent(K_CHANGE_EVENT);
          this.dispatchEvent(changeEvent);
      }
      handleFocus() {
          this.hasFocus = true;
          const focusEvent = new CustomEvent(K_FOCUS_EVENT);
          this.dispatchEvent(focusEvent);
          // if (this.hasInput && this.results.getAllItems().length > 0) {
          //   this.showResults();
          // }
      }
      handleKeyDown(event) {
          const key = event.key.toLowerCase();
          if (!this.results) {
              return;
          }
          /**
           * Implement ARIA best practices for comboboxes keyboard support.
           * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/#kbd_label}
           */
          if (key === 'arrowdown' && event.altKey) {
              /**
               * Opens the listbox without moving focus or changing selection.
               */
              this.showResults();
          }
          else if (key === 'arrowdown') {
              /**
               * Opens the listbox and moves focus to the first option.
               */
              this.showResults();
              this.results.focusFirst();
          }
          else if (key === 'arrowup') {
              /**
               * Opens the listbox and moves focus to the last option.
               */
              if (!this.showingResults) {
                  this.showResults();
              }
              this.results.focusLast();
          }
          else if (key === 'enter') {
              /**
               * Closes the listbox and returns focus to the input.
               */
              if (this.showingResults) {
                  this.hideResults();
                  this.input.focus();
              }
          }
          else if (key === 'escape') {
              /**
               * If the listbox is displayed, closes it. Returns focus to the input.
               */
              if (this.showingResults) {
                  this.hideResults();
              }
              else {
                  /**
                   * If the listbox is not displayed, clears the textbox.
                   */
                  this.input.value = '';
                  this.isActive = false;
              }
              this.input.focus();
          }
      }
      handleDocumentMouseDown(event) {
          if (!this.open) {
              return;
          }
          /**
           * Close when clicking outside of the containing element
           */
          const path = event.composedPath();
          if (!path.includes(this.results)) {
              this.hideResults();
          }
      }
      handleInput() {
          if (this.input.value.trim().length > 0) {
              this.isActive = true;
          }
          else {
              this.isActive = false;
          }
          const inputEvent = new CustomEvent(K_INPUT_EVENT, {
              bubbles: true,
          });
          this.dispatchEvent(inputEvent);
      }
      handleResultsChangeEvent() {
          this.showResults();
      }
      handleResultsCloseEvent() {
          this.hideResults();
      }
      itemInViewport(item) {
          const bounding = item.getBoundingClientRect();
          return (bounding.top >= 0 &&
              bounding.left >= 0 &&
              bounding.bottom <=
                  (window.innerHeight || document.documentElement.clientHeight) &&
              bounding.right <=
                  (window.innerWidth || document.documentElement.clientWidth));
      }
      handleOpenChange() {
          /**
           * Hide the results when not open.
           */
          if (!this.open) {
              this.hideResults();
          }
      }
      handleShowingResultsChange() {
          if (this.showingResults) {
              this.addShowingListeners();
          }
          else {
              this.removeShowingListeners();
              this.input.focus();
          }
      }
      hideResults() {
          this.showingResults = false;
      }
      showResults() {
          this.showingResults = true;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "loading", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "minlength", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "maxlength", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "name", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "open", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "placeholder", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "required", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.SearchBar.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.SearchBar.prototype, "theme", void 0);
  __decorate([
      n$5({
          attribute: true,
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "value", void 0);
  __decorate([
      l$3({ flatten: true, slot: 'results' }),
      __metadata("design:type", Array)
  ], exports.SearchBar.prototype, "resultsItems", void 0);
  __decorate([
      i$2('[part="base"]'),
      __metadata("design:type", HTMLElement)
  ], exports.SearchBar.prototype, "base", void 0);
  __decorate([
      i$2('[part="results"]'),
      __metadata("design:type", HTMLElement)
  ], exports.SearchBar.prototype, "resultsContainer", void 0);
  __decorate([
      i$2('.search-bar__input-control'),
      __metadata("design:type", HTMLInputElement)
  ], exports.SearchBar.prototype, "input", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "hasFocus", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "isActive", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.SearchBar.prototype, "showingResults", void 0);
  exports.SearchBar = __decorate([
      customElement('search-bar'),
      __metadata("design:paramtypes", [])
  ], exports.SearchBar);

  var css_248z$f = i$6`:host{color:rgba(0,0,0,.122);display:inline-block}.tab{background:0 0;border:none;cursor:pointer;display:inline-flex;text-decoration:none}.tab:focus{outline:0}.tab--disabled{cursor:not-allowed}.tab__badge::slotted(*){background-color:var(--k-color-kong);border-radius:4px;color:var(--k-color-white);display:inline-flex;font-weight:var(--k-font-weight-medium)}.tab--sm{font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm)}.tab--md{font-size:var(--k-font-size-base);line-height:var(--k-line-height-base)}.tab--sm .tab__badge::slotted(*){font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm);padding-block:var(--k-size-0-5);padding-inline:var(--k-size-1-5)}.tab--md .tab__badge::slotted(*){font-size:var(--k-font-size-sm);line-height:var(--k-line-height-sm);padding-block:var(--k-size-0-5);padding-inline:var(--k-size-2)}.tab--pill{align-items:center;border-radius:100px;color:var(--k-color-gray-900);display:flex;font-weight:var(--k-font-weight-semibold);justify-content:center}.tab--pill.tab--reversed{color:var(--k-color-white)}.tab--pill.tab--reversed.tab--current{background-color:var(--k-color-white);color:var(--k-color-gray-900)}.tab--pill.tab--current:not(.tab--disabled):hover,.tab--pill:not(.tab--disabled):hover{background-color:var(--k-color-gray-800);color:var(--k-color-white)}.tab--pill.tab--reversed.tab--current:not(.tab--disabled):hover,.tab--pill.tab--reversed:not(.tab--disabled):hover{background-color:var(--k-color-white);color:var(--k-color-gray-800)}.tab--pill:not(.tab--disabled):focus-visible{background-color:var(--k-color-white);box-shadow:var(--k-focus-ring-kong-4);color:var(--k-color-gray-900)}.tab--pill.tab--current:not(.tab--disabled):focus-visible{background-color:var(--k-color-gray-800);box-shadow:var(--k-focus-ring-kong-4);color:var(--k-color-white)}.tab--pill.tab--sm{gap:var(--k-size-2);padding-block:7px;padding-inline:var(--k-size-3)}.tab--pill.tab--md{gap:var(--k-size-2);padding-block:var(--k-size-2);padding-inline:var(--k-size-3-5)}.tab--pill.tab--current{background-color:var(--k-color-gray-800);color:var(--k-color-white)}.tab--underline{align-items:center;color:var(--k-color-gray-900);display:flex;font-weight:var(--k-font-weight-semibold);justify-content:center}.tab--underline.tab--sm{gap:8px;padding-block:var(--k-size-1) var(--k-size-1-5);padding-inline:var(--k-size-0-5)}.tab--underline.tab--md{gap:8px;padding-block:0 var(--k-size-3);padding-inline:var(--k-size-1)}.tab--underline.tab--current{box-shadow:inset 0 -3px 0 0 var(--k-color-gray-900)}.tab--underline:not(.tab--disabled):focus-visible,.tab--underline:not(.tab--disabled):hover{box-shadow:inset 0 -3px 0 0 var(--k-color-kong)}`;
  var styles$f = css_248z$f;
  styleInject(css_248z$f);

  /**
   * A Tab appears as a navigation item within a Tabs component.
   *
   * @element k-tab
   *
   * @slot - The tab label.
   * @slot badge - An optional tab badge.
   *
   * @csspart base - The tab base wrapper.
   */
  exports.Tab = class Tab extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Indicates a currently active tab. */
          this.current = false;
          /** Indicates a disabled tab, which prevents it from being selected. */
          this.disabled = false;
          this.label = '';
          /** The name of the associated tab panel. */
          this.panel = '';
          /** The tab button's size. */
          this.size = 'md';
          /** The tab button's theme. */
          this.theme = 'reversed';
          /** The tab button's variant. */
          this.variant = 'underline';
      }
      static { this.styles = [KonstructElement.styles, styles$f]; }
      get isLink() {
          return this.href ? true : false;
      }
      get tag() {
          if (this.isLink) {
              return i `a`;
          }
          else {
              return i `button`;
          }
      }
      blur() {
          this.tab.blur();
      }
      connectedCallback() {
          super.connectedCallback();
          this.setAttribute('role', 'tab');
      }
      focus(options) {
          this.tab.focus(options);
      }
      render() {
          return n `
      <${this.tag}
        class=${classMap('tab', `tab--${this.size}`, `tab--${this.theme}`, `tab--${this.variant}`, {
            'tab--current': this.current,
            'tab--disabled': this.disabled,
        })}
        ?disabled=${this.disabled}
        href=${l$2(this.href)}
        part="base"
        target=${l$2(this.target)}
        type="button"
      >
        <slot>${this.label}</slot>

        <slot
          class="tab__badge"
          name="badge"
        ></slot>
      </${this.tag}>
    `;
      }
      updated(changedProperties) {
          if (changedProperties.has('current')) {
              this.setAttribute('aria-selected', this.current ? 'true' : 'false');
          }
          if (changedProperties.has('disabled')) {
              this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
          }
      }
  };
  __decorate([
      i$2('.tab'),
      __metadata("design:type", HTMLElement)
  ], exports.Tab.prototype, "tab", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Tab.prototype, "current", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Tab.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Tab.prototype, "href", void 0);
  __decorate([
      n$5({
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.Tab.prototype, "label", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.Tab.prototype, "panel", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Tab.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Tab.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Tab.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Tab.prototype, "variant", void 0);
  exports.Tab = __decorate([
      customElement('tab')
  ], exports.Tab);

  var css_248z$e = i$6`:host{display:none}:host([active]){display:block}.tab-panel{display:block}`;
  var styles$e = css_248z$e;
  styleInject(css_248z$e);

  let id = 0;
  /**
   * A Tab panel is used within a Tabs component to display tabbed content.
   *
   * @element k-tab-panel
   *
   * @slot - The tab panel content.
   *
   * @csspart base - The tab base wrapper.
   */
  exports.TabPanel = class TabPanel extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The name of the tab panel. */
          this.name = '';
          /** Shows or hides the tab panel. */
          this.active = false;
          this.panelNum = ++id;
          this.defaultId = `konstruct-tab-panel-${this.panelNum}`;
      }
      static { this.styles = [KonstructElement.styles, styles$e]; }
      connectedCallback() {
          super.connectedCallback();
          this.setAttribute('role', 'tabpanel');
      }
      render() {
          return x `<slot class="${classMap({
            'tab-panel': true,
            'tab-panel--active': this.active,
        })}" part="base"></slot>`;
      }
      updated(changedProperties) {
          if (changedProperties.has('active')) {
              this.setAttribute('aria-hidden', this.active ? 'false' : 'true');
          }
      }
  };
  __decorate([
      n$5({ reflect: true }),
      __metadata("design:type", Object)
  ], exports.TabPanel.prototype, "name", void 0);
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.TabPanel.prototype, "active", void 0);
  exports.TabPanel = __decorate([
      customElement('tab-panel')
  ], exports.TabPanel);

  const K_TAB_HIDE_EVENT = 'k-tab-hide';

  const K_TAB_SHOW_EVENT = 'k-tab-show';

  /**
   * Returns an element's offset relative to its parent. Similar to element.offsetTop and element.offsetLeft, except the
   * parent doesn't have to be positioned relative or absolute.
   *
   * NOTE: This was created to work around what appears to be a bug in Chrome where a slotted element's offsetParent seems
   * to ignore elements inside the surrounding shadow DOM: https://bugs.chromium.org/p/chromium/issues/detail?id=920069
   */
  function getOffset(element, parent) {
      return {
          left: Math.round(element.getBoundingClientRect().left -
              parent.getBoundingClientRect().left),
          top: Math.round(element.getBoundingClientRect().top - parent.getBoundingClientRect().top),
      };
  }

  function scrollIntoView(element, container, direction = 'vertical', behavior = 'smooth') {
      const offset = getOffset(element, container);
      const offsetTop = offset.top + container.scrollTop;
      const offsetLeft = offset.left + container.scrollLeft;
      const minX = container.scrollLeft;
      const maxX = container.scrollLeft + container.offsetWidth;
      const minY = container.scrollTop;
      const maxY = container.scrollTop + container.offsetHeight;
      if (direction === 'horizontal' || direction === 'both') {
          if (offsetLeft < minX) {
              container.scrollTo({ behavior, left: offsetLeft });
          }
          else if (offsetLeft + element.clientWidth > maxX) {
              container.scrollTo({
                  behavior,
                  left: offsetLeft - container.offsetWidth + element.clientWidth,
              });
          }
      }
      if (direction === 'vertical' || direction === 'both') {
          if (offsetTop < minY) {
              container.scrollTo({ behavior, top: offsetTop });
          }
          else if (offsetTop + element.clientHeight > maxY) {
              container.scrollTo({
                  behavior,
                  top: offsetTop - container.offsetHeight + element.clientHeight,
              });
          }
      }
  }

  var css_248z$d = i$6`:host{display:block}.tabs{display:flex;flex-direction:column;height:100%}.tabs__tab-items{box-shadow:inset 0 -3px 0 0 var(--k-color-gray-200);display:flex;flex:1 1 auto;flex-direction:row;gap:var(--k-size-3-5);position:relative}.tabs__body{display:block}.tabs__nav{display:flex;overflow-x:auto;scrollbar-width:none}.tabs .tabs__nav::-webkit-scrollbar{height:0;width:0}`;
  var styles$d = css_248z$d;
  styleInject(css_248z$d);

  /**
   * Tabs organize similar content together into individual sections
   *   in the same page.
   *
   * @element k-tabs
   *
   * @slot - The container for grouping tab panels. This must consist of
   * konstruct-tab-panel elements.
   * @slot nav - The tab group, consisting of `konstruct-tab` elements.
   *
   * @csspart base - The base element container.
   * @csspart nav - The tabs navigation container element.
   * @csspart tabs - The tabs list container.
   * @csspart body - The panel content body container.
   */
  exports.Tabs = class Tabs extends KonstructElement {
      constructor() {
          super(...arguments);
          this.panels = [];
          this.tabs = [];
      }
      static { this.styles = [KonstructElement.styles, styles$d]; }
      connectedCallback() {
          super.connectedCallback();
          this.mutationObserver = new MutationObserver((mutations) => {
              // Update aria labels when the DOM changes
              if (mutations.some((m) => !['aria-labelledby', 'aria-controls'].includes(m.attributeName))) {
                  setTimeout(() => this.setAriaLabels());
              }
              // Sync tabs when disabled states change
              if (mutations.some((m) => m.attributeName === 'disabled')) {
                  this.cacheTabsAndPanels();
              }
          });
          this.updateComplete.then(() => {
              this.cacheTabsAndPanels();
              this.mutationObserver.observe(this, {
                  attributes: true,
                  childList: true,
                  subtree: true,
              });
              // Set initial tab state when the tabs first become visible
              const intersectionObserver = new IntersectionObserver((entries, observer) => {
                  if (entries[0].intersectionRatio > 0) {
                      this.setAriaLabels();
                      this.setCurrentTab(this.getCurrentTab() ?? this.tabs[0], {
                          emitEvents: false,
                      });
                      observer.unobserve(entries[0].target);
                  }
              });
              intersectionObserver.observe(this.container);
          });
      }
      disconnectedCallback() {
          this.mutationObserver.disconnect();
      }
      render() {
          return x `<div part="base" class="${classMap({
            tabs: true,
        })}" @click="${this.handleClick}" @keydown="${this.handleKeyDown}"><div class="tabs__nav-container" part="nav"><div class="tabs__nav"><div part="tabs" class="tabs__tab-items" role="tablist"><slot name="nav" @slotchange="${this.cacheTabsAndPanels}"></slot></div></div></div><slot part="body" class="tabs__body" @slotchange="${this.cacheTabsAndPanels}"></slot></div>`;
      }
      /**
       * Cache the tabs and panels instead of calling querySelectorAll()
       * multiple times.
       */
      cacheTabsAndPanels() {
          this.tabs = this.getTabs({ includeDisabled: false });
          this.panels = this.getPanels();
      }
      getCurrentTab() {
          return this.tabs.find((el) => el.current);
      }
      getPanels() {
          return [...this.body.assignedElements()].filter((el) => el.tagName.toLowerCase() === 'konstruct-tab-panel');
      }
      getTabs(options = { includeDisabled: true }) {
          const slot = this.shadowRoot?.querySelector('slot[name="nav"]');
          return [...slot?.assignedElements()].filter((el) => {
              return options.includeDisabled
                  ? el.tagName.toLowerCase() === 'konstruct-tab'
                  : el.tagName.toLowerCase() === 'konstruct-tab' && !el.disabled;
          });
      }
      handleClick(event) {
          const target = event.target;
          const tab = target.closest('konstruct-tab');
          const tabContainer = tab?.closest('konstruct-tabs');
          // Ensure the target tab is in this tab group
          if (tabContainer !== this) {
              return;
          }
          if (tab !== null) {
              this.setCurrentTab(tab, { scrollBehavior: 'smooth' });
          }
      }
      handleKeyDown(event) {
          const target = event.target;
          const tab = target.closest('konstruct-tab');
          const tabGroup = tab?.closest('konstruct-tabs');
          // Ensure the target tab is in this tab group
          if (tabGroup !== this) {
              return;
          }
          // Activate a tab
          if (['Enter', ' '].includes(event.key)) {
              if (tab !== null) {
                  this.setCurrentTab(tab, { scrollBehavior: 'smooth' });
                  event.preventDefault();
              }
          }
          // Move focus left or right
          if ([
              'ArrowLeft',
              'ArrowRight',
              'ArrowUp',
              'ArrowDown',
              'Home',
              'End',
          ].includes(event.key)) {
              const activeEl = this.tabs.find((t) => t.matches(':focus'));
              if (activeEl?.tagName.toLowerCase() === 'konstruct-tab') {
                  let index = this.tabs.indexOf(activeEl);
                  if (event.key === 'Home') {
                      index = 0;
                  }
                  else if (event.key === 'End') {
                      index = this.tabs.length - 1;
                  }
                  else if (event.key === 'ArrowLeft') {
                      index--;
                  }
                  else if (event.key === 'ArrowRight') {
                      index++;
                  }
                  if (index < 0) {
                      index = this.tabs.length - 1;
                  }
                  if (index > this.tabs.length - 1) {
                      index = 0;
                  }
                  // Move focus to the new tab
                  this.tabs[index].focus({ preventScroll: true });
                  this.setCurrentTab(this.tabs[index], {
                      scrollBehavior: 'smooth',
                  });
                  scrollIntoView(this.tabs[index], this.nav, 'horizontal');
                  event.preventDefault();
              }
          }
      }
      setAriaLabels() {
          // Link each tab with its corresponding panel
          this.tabs.forEach((tab) => {
              const panel = this.panels.find((el) => el.name === tab.panel);
              if (panel) {
                  tab.setAttribute('aria-controls', panel.getAttribute('id'));
                  panel.setAttribute('aria-labelledby', tab.getAttribute('id'));
              }
          });
      }
      setCurrentTab(tab, options) {
          options = {
              emitEvents: true,
              scrollBehavior: 'auto',
              ...options,
          };
          if (tab !== this.currentTab && !tab.disabled) {
              const previousTab = this.currentTab;
              this.currentTab = tab;
              // Sync current tab and panel
              this.tabs.map((el) => (el.current = el === this.currentTab));
              this.panels.map((el) => (el.active = el.name === this.currentTab?.panel));
              scrollIntoView(this.currentTab, this.nav, 'horizontal', options.scrollBehavior);
              // Emit events
              if (options.emitEvents) {
                  if (previousTab) {
                      const hideEvent = new CustomEvent(K_TAB_HIDE_EVENT, { detail: { name: previousTab.panel } });
                      this.dispatchEvent(hideEvent);
                  }
                  const showEvent = new CustomEvent(K_TAB_SHOW_EVENT, { detail: { name: this.currentTab.panel } });
                  this.dispatchEvent(showEvent);
              }
          }
      }
  };
  __decorate([
      i$2('.tabs'),
      __metadata("design:type", HTMLElement)
  ], exports.Tabs.prototype, "container", void 0);
  __decorate([
      i$2('.tabs__body'),
      __metadata("design:type", HTMLSlotElement)
  ], exports.Tabs.prototype, "body", void 0);
  __decorate([
      i$2('.tabs__nav'),
      __metadata("design:type", HTMLElement)
  ], exports.Tabs.prototype, "nav", void 0);
  exports.Tabs = __decorate([
      customElement('tabs')
  ], exports.Tabs);

  var css_248z$c = i$6`:host{--category-tag-active-background:var(--k-color-gray-900);--category-tag-active-color:var(--k-color-white);--category-tag-background-disabled:var(--k-color-gray-50);--category-tag-background:rgb(0 0 0/4%);--category-tag-border-disabled:1px dashed var(--k-color-gray-900);--category-tag-border:none;--category-tag-color:var(--k-color-gray-900);--category-tag-focus-background:var(--k-color-black-6);--category-tag-focus-color:var(--k-color-gray-900);--category-tag-hover-background:var(--k-color-kong);--category-tag-hover-color:var(--k-color-white);display:inline-block}.category-tag{align-items:center;background:var(--category-tag-background);border:var(--category-tag-border);border-radius:100px;color:var(--category-tag-color);display:inline-flex;flex-direction:column;font-size:var(--k-font-size-md);font-weight:var(--k-font-weight-semibold);justify-content:center;line-height:var(--k-line-height-md);padding:4px 12px;position:relative;text-decoration:none;white-space:nowrap}.category-tag--theme-reversed{--category-tag-active-background:var(--k-color-white);--category-tag-active-color:var(--k-color-gray-900);--category-tag-background-disabled:var(--k-color-black-12);--category-tag-background:var(--k-color-sheer-black-50);--category-tag-border-disabled:1px dashed var(--k-color-white);--category-tag-color:var(--k-color-white);--category-tag-focus-background:var(--k-color-white-20);--category-tag-focus-color:var(--k-color-white)}.category-tag--active:not(.category-tag--disabled){background:var(--category-tag-active-background);color:var(--category-tag-active-color)}.category-tag--disabled{background:var(--category-tag-background-disabled);border:var(--category-tag-border-disabled)}.category-tag:not(.category-tag--disabled):hover{background:var(--category-tag-hover-background);color:var(--category-tag-hover-color)}.category-tag:focus{outline:0}.category-tag:focus-visible:not(.category-tag--disabled){box-shadow:var(--k-focus-ring-kong-4)}.category-tag:focus-visible:not(.category-tag--disabled):not(.category-tag--active){background:var(--category-tag-focus-background);color:var(--category-tag-focus-color)}`;
  var styles$c = css_248z$c;
  styleInject(css_248z$c);

  /**
   * A category-tag is an interactive colored label used to organize cateogories.
   *
   * @element k-category-tag
   *
   * @event k-focus - Dispatched when the button is focused.
   * @event k-blur - Dispatched when the button is blurred.
   * @event k-click - Dispatched when the button is clicked.
   *
   * @csspart base - The component's base wrapper.
   * @csspart label - The tag label text.
   */
  exports.CategoryTag = class CategoryTag extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Marks the category tag as being active. */
          this.active = false;
          /** Disables the button. */
          this.disabled = false;
          /** The category tag theme. */
          this.theme = 'reversed';
          /**
           * The button type. Please note the default is "button", and not "submit",
           * which is the default for native button elements.
           */
          this.type = 'button';
          this.hasFocus = false;
          this.hrefAttribute = i `href`;
      }
      static { this.styles = [KonstructElement.styles, styles$c]; }
      get isLink() {
          return this.href ? true : false;
      }
      get tag() {
          if (this.isLink) {
              return i `a`;
          }
          else {
              return i `button`;
          }
      }
      connectedCallback() {
          super.connectedCallback();
          this.handleHostClick = this.handleHostClick.bind(this);
          this.addEventListener('click', this.handleHostClick);
      }
      disconnectedCallback() {
          super.disconnectedCallback();
          this.removeEventListener('click', this.handleHostClick);
      }
      render() {
          return n `
      <${this.tag}
        class=${classMap({
            'category-tag': true,
            'category-tag--active': this.active,
            'category-tag--disabled': this.disabled,
            'category-tag--focused': this.hasFocus,
            [`category-tag--theme-${this.theme}`]: true,
            tag: true,
        })}
        ${this.hrefAttribute}=${l$2(this.href)}
        part="base"
        target=${l$2(this.target)}
        type=${l$2(this.isLink ? undefined : this.type)}
        ?disabled=${l$2(this.isLink ? undefined : this.disabled)}
        @blur=${this.handleBlur}
        @click=${this.handleClick}
        @focus=${this.handleFocus}
      >
        <slot class="category-tag__label" part="label"></slot>
      </${this.tag}>
    `;
      }
      handleBlur() {
          this.hasFocus = false;
          const blurEvent = new CustomEvent(K_BLUR_EVENT);
          this.dispatchEvent(blurEvent);
      }
      handleClick() {
          const clickEvent = new CustomEvent(K_CLICK_EVENT, {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(clickEvent);
      }
      handleFocus() {
          this.hasFocus = true;
          const focusEvent = new CustomEvent(K_FOCUS_EVENT);
          this.dispatchEvent(focusEvent);
      }
      handleHostClick(event) {
          if (this.disabled) {
              event.preventDefault();
              event.stopImmediatePropagation();
          }
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.CategoryTag.prototype, "active", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.CategoryTag.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.CategoryTag.prototype, "href", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.CategoryTag.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.CategoryTag.prototype, "theme", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", String)
  ], exports.CategoryTag.prototype, "type", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.CategoryTag.prototype, "hasFocus", void 0);
  exports.CategoryTag = __decorate([
      customElement('category-tag')
  ], exports.CategoryTag);

  var css_248z$b = i$6`:host{--tag-background:var(--k-color-gray-100);--tag-background-hover:var(--k-color-kong);--tag-color:var(--k-color-gray-900);--tag-color-hover:var(--k-color-white);--tag-dismiss-background-hover:var(--k-color-white-20);--tag-dismiss-shadow:var(--k-focus-ring-kong-4);display:inline-flex}.tag{align-items:center;background:var(--tag-background);border-radius:4px;border-style:none;color:var(--tag-color);display:inline-flex;font-size:var(--tag-font-size);font-weight:var(--tag-font-weight);gap:var(--tag-gap);height:var(--tag-height);justify-content:center;line-height:var(--tag-line-height);padding:var(--tag-padding);-webkit-user-select:none;-moz-user-select:none;user-select:none;white-space:nowrap}.tag:hover{background:var(--tag-background-hover)}.tag:hover,.tag:hover .tag__dismiss{color:var(--tag-color-hover)}.tag--size-sm{--tag-dismiss-font-size:10px;--tag-dismiss-padding:2px;--tag-font-size:12px;--tag-font-weight:600;--tag-gap:1px;--tag-height:20px;--tag-line-height:18px;--tag-padding:1px 5px}.tag--size-sm.tag--dismissable{--tag-padding:1px 2px 1px 5px}.tag--size-md{--tag-dismiss-font-size:12px;--tag-dismiss-padding:2px;--tag-font-size:14px;--tag-font-weight:500;--tag-gap:2px;--tag-height:24px;--tag-line-height:20px;--tag-padding:2px 8px}.tag--size-md.tag--dismissable{--tag-padding:2px 3px 2px 8px}.tag--size-lg{--tag-dismiss-font-size:14px;--tag-dismiss-padding:3px;--tag-font-size:14px;--tag-font-weight:500;--tag-gap:3px;--tag-height:28px;--tag-line-height:20px;--tag-padding:4px 10px}.tag--size-lg.tag--dismissable{--tag-padding:4px 3px 4px 9px}.tag--theme-reversed{--tag-background-hover:var(--k-color-kong);--tag-background:var(--k-color-gray-900);--tag-color-hover:var(--k-color-white);--tag-color:var(--k-color-white);--tag-dismiss-background-hover:var(--k-color-black-20);--tag-dismiss-shadow:var(--k-focus-ring-dark-4)}.tag--blurred{-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}.tag__dismiss{align-items:flex-start;background:0 0;border-radius:4px;border-style:none;color:var(--tag-color);display:inline-flex;flex-direction:column;font-size:var(--tag-dismiss-font-size);padding:var(--tag-dismiss-padding)}.tag__dismiss:not(:disabled) k-material-icon{cursor:pointer}.tag__dismiss:hover{background:var(--tag-dismiss-background-hover)}.tag__dismiss:focus{outline:0}.tag__dismiss:focus-visible{background:0 0;box-shadow:var(--tag-dismiss-shadow)}`;
  var styles$b = css_248z$b;
  styleInject(css_248z$b);

  /**
   * A tag is a small, colored label that can be used to display a short piece of information.
   *
   * @element k-tag
   *
   * @property {Boolean} blurred - Blurs the background of the tag.
   * @property {Boolean} dismissable - Adds a close button to the tag.
   * @property {'sm'|'md'|'lg'} size - The size of the tag.
   * @property {'default'|'reversed'} theme - The tag theme.
   *
   * @slot - The tag content.
   *
   * @event k-dismiss â€“ Emitted when the close button is activated.
   *
   * @csspart base - The base element.
   * @csspart content - The tag content.
   *
   * @cssproperty --tag-background - The tag's background color.
   * @cssproperty --tag-background-hover - The tag's background color on hover.
   * @cssproperty --tag-color - The tag's content color.
   * @cssproperty --tag-color-hover - The tag's content color on hover.
   * @cssproperty --tag-dismiss-background-hover - The dismiss button background color on hover.
   * @cssproperty --tag-dismiss-shadow - The dismiss button shadow on focus.
   */
  exports.Tag = class Tag extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Blurs the background of the tag. */
          this.blurred = false;
          /** Adds a close button to the trailing slot of a tag.*/
          this.dismissable = false;
          /** The size of the tag. */
          this.size = 'sm';
          /** The tag theme. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$b]; }
      render() {
          return x `<span class="${classMap({
            tag: true,
            'tag--blurred': this.blurred,
            'tag--dismissable': this.dismissable,
            [`tag--size-${this.size}`]: true,
            [`tag--theme-${this.theme}`]: true,
        })}" part="base"><slot part="content" class="tag__content"></slot>${n$2(this.dismissable, () => x `<button class="tag__dismiss" size="${this.size}" type="button" @click="${this.handleDismissClick}"><k-material-icon name="close" slot="leading"></k-material-icon></button>`)}</span>`;
      }
      handleDismissClick() {
          const dismissEvent = new CustomEvent(K_DISMISS_EVENT);
          this.dispatchEvent(dismissEvent);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Tag.prototype, "blurred", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Tag.prototype, "dismissable", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Tag.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Tag.prototype, "theme", void 0);
  exports.Tag = __decorate([
      customElement('tag')
  ], exports.Tag);

  var css_248z$a = i$6`:host{display:contents}.toast{align-items:stretch;box-shadow:var(--k-shadow-xl);color:var(--k-color-white);display:flex;font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-medium);gap:var(--k-size-1);line-height:var(--k-line-height-sm);margin-bottom:var(--k-size-4);padding:var(--k-size-2-5);position:relative;transform-origin:top}.toast--alert{background-color:var(--k-color-kong)}.toast--default{background-color:var(--k-color-gray-800)}.toast--info{background-color:var(--k-color-blue-dark-500)}.toast--warning{background-color:var(--k-color-warning-500)}.toast__close-button:focus{outline:0}.toast__close-button:focus-visible{box-shadow:0 0 0 2px var(--k-color-white)}.toast__content{display:block;flex:1 1 auto}.toast k-material-icon{pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}`;
  var styles$a = css_248z$a;
  styleInject(css_248z$a);

  const toastStack = Object.assign(document.createElement('div'), {
      className: 'k-toast-stack',
  });
  /**
   * A toast is used to display a temporary notification to a user.
   *
   * @element k-toast
   *
   * @event k-show - Dispatched once the alert opens.
   * @event k-after-show - Dispatched after the show animation completes.
   * @event k-hide - Dispatched once the alert closes.
   * @event k-after-hide - Dispatched after the hide animation completes.
   *
   * @csspart base - The base element container.
   * @csspart close-button - The close button.
   */
  exports.Toast = class Toast extends KonstructElement {
      constructor() {
          super(...arguments);
          this.content = '';
          /* Indicates if the toast is displayed or not. */
          this.open = false;
          /* The toast's color theme. */
          this.variant = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$a]; }
      firstUpdated() {
          this.base.hidden = !this.open;
      }
      async handleOpenChange() {
          if (this.open) {
              // Show
              const showEvent = new CustomEvent(K_SHOW_EVENT);
              this.dispatchEvent(showEvent);
              this.base.hidden = false;
              /**
               * Animate showing the toast.
               */
              await animate(this.base, {
                  opacity: [0, 1],
                  scale: [0.95, 1],
                  transform: ['translateX(25%)', 'translateX(0%)'],
              }, { duration: 0.3, easing: [0.29, 0.17, 0.08, 1] }).finished;
              const afterShowEvent = new CustomEvent(K_AFTER_SHOW_EVENT);
              this.dispatchEvent(afterShowEvent);
          }
          else {
              // Hide
              const hideEvent = new CustomEvent(K_HIDE_EVENT);
              this.dispatchEvent(hideEvent);
              /**
               * Animate hiding the toast.
               */
              await animate(this.base, {
                  marginTop: ['0px', `-${this.base.offsetHeight + 16}px`],
                  opacity: [1, 0],
                  scale: [1, 0.95],
              }, { duration: 0.25, easing: 'ease-out' }).finished;
              this.base.hidden = true;
              const afterHideEvent = new CustomEvent(K_AFTER_HIDE_EVENT);
              this.dispatchEvent(afterHideEvent);
          }
      }
      /** Hide the toast */
      async hide() {
          if (!this.open) {
              return undefined;
          }
          this.open = false;
          return waitForEvent(this, K_AFTER_HIDE_EVENT);
      }
      /* Show the toast */
      async show() {
          if (this.open) {
              return undefined;
          }
          this.open = true;
          return waitForEvent(this, K_AFTER_SHOW_EVENT);
      }
      async toast() {
          return new Promise((resolve) => {
              if (toastStack.parentElement === null) {
                  document.body.append(toastStack);
                  toastStack.style.insetInlineEnd = '0';
                  toastStack.style.maxHeight = '100%';
                  toastStack.style.maxWidth = '100%';
                  toastStack.style.overflow = 'visible';
                  toastStack.style.position = 'fixed';
                  toastStack.style.right = '1rem';
                  toastStack.style.top = '1rem';
                  toastStack.style.width = '18.75rem';
                  toastStack.style.zIndex = 'var(--k-z-100)';
              }
              toastStack.appendChild(this);
              this.show();
              this.addEventListener(K_AFTER_HIDE_EVENT, () => {
                  toastStack.removeChild(this);
                  resolve();
                  // Remove the toast stack from the DOM when there are no more toasts
                  if (toastStack.querySelector('k-toast') === null) {
                      toastStack.remove();
                  }
              }, { once: true });
          });
      }
      render() {
          return x `<div part="base" class="${classMap('toast', `toast--${this.variant}`, {
            'toast--open': this.open,
        })}" role="alert" aria-hidden="${this.open ? 'false' : 'true'}"><slot class="toast__content">${this.content}</slot><button type="button" @click="${this.handleCloseClick}" part="close-button" class="toast__close-button" label="close"><k-material-icon name="close"></k-material-icon></button></div>`;
      }
      updated(changedProperties) {
          if (changedProperties.has('open')) {
              this.handleOpenChange();
          }
      }
      handleCloseClick() {
          this.hide();
      }
  };
  __decorate([
      n$5({
          type: String,
      }),
      __metadata("design:type", Object)
  ], exports.Toast.prototype, "content", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.Toast.prototype, "open", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Toast.prototype, "variant", void 0);
  __decorate([
      i$2('[part="base"]'),
      __metadata("design:type", HTMLElement)
  ], exports.Toast.prototype, "base", void 0);
  exports.Toast = __decorate([
      customElement('toast')
  ], exports.Toast);

  var css_248z$9 = i$6`:host{display:flex}.card-status-action-label{align-items:center;background:0 0;border-style:none;color:var(--k-color-gray-900);display:inline-flex;font-size:var(--k-font-size-sm);font-weight:600;gap:4px;line-height:var(--k-line-height-sm);text-decoration:none}.card-status-action-label--inline{border-radius:4px;gap:3px;padding:0 4px 0 2px}.card-status-action-label--inline .card-status-action-label__icon{color:var(--k-color-kong);font-size:var(--k-font-size-md);line-height:var(--k-line-height-md)}.card-status-action-label--inline .card-status-action-label__indicator{align-items:center;display:flex;gap:1px}.card-status-action-label--inline:hover{background:var(--k-color-kong);color:var(--k-color-white)}.card-status-action-label--inline:hover .card-status-action-label__icon,.card-status-action-label--theme-reversed{color:var(--k-color-white)}.card-status-action-label:not(.card-status-action-label--inline) .card-status-action-label__indicator{align-items:center;display:flex;flex-direction:column;gap:10px;height:24px;justify-content:flex-end;padding-bottom:0}.card-status-action-label:not(.card-status-action-label--inline) k-profile-stat-badge{transition:transform var(--k-transition-fast) ease-in-out}.card-status-action-label:not(.card-status-action-label--inline):hover k-profile-stat-badge{transform:translateY(-2px)}.card-status-action-label k-profile-stat-badge{pointer-events:none}`;
  var styles$9 = css_248z$9;
  styleInject(css_248z$9);

  /**
   * @element k-card-status-action-label
   *
   * @csspart base - The component's base wrapper.
   * @csspart label - The label text.
   */
  exports.StatusActionLabel = class StatusActionLabel extends KonstructElement {
      constructor() {
          super(...arguments);
          /** A count value. */
          this.count = 0;
          /** Disables the button. */
          this.disabled = false;
          /** Inline status action labels have tigher layout spacing. */
          this.inline = false;
          /** The status action label size. */
          this.size = 'sm';
          /** The theme to display the status-action-label in. */
          this.theme = 'reversed';
          /**
           * The button type. Please note the default is "button", and not "submit",
           * which is the default for native button elements.
           */
          this.type = 'button';
          this.hasFocus = false;
          this.hrefAttribute = i `href`;
      }
      static { this.styles = [KonstructElement.styles, styles$9]; }
      get formattedCount() {
          return String(this.count);
      }
      get isLink() {
          return this.href ? true : false;
      }
      get tag() {
          if (this.isLink) {
              return i `a`;
          }
          else {
              return i `button`;
          }
      }
      connectedCallback() {
          super.connectedCallback();
          this.handleHostClick = this.handleHostClick.bind(this);
          this.addEventListener('click', this.handleHostClick);
      }
      disconnectedCallback() {
          super.disconnectedCallback();
          this.removeEventListener('click', this.handleHostClick);
      }
      render() {
          return n `
      <${this.tag}
        class=${classMap({
            'card-status-action-label': true,
            'card-status-action-label--inline': this.inline,
            [`card-status-action-label--size-${this.size}`]: true,
            [`card-status-action-label--theme-${this.theme}`]: true,
        })}
        ${this.hrefAttribute}=${l$2(this.href)}
        ?disabled=${this.isLink ? undefined : this.disabled}
        part="base"
        target=${l$2(this.target)}
        type=${l$2(this.isLink ? undefined : this.type)}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
      >
        <div class="card-status-action-label__indicator">
          ${n$2(this.inline, () => n `<slot
                  class="card-status-action-label__icon"
                  name="icon"
                ></slot>
                ${n$2(this.count, () => n `<div>${this.count}</div>`)}`, () => n `
              <k-profile-stat-badge
                size=${this.size}
                theme=${this.theme}
              >
                <slot
                  class="card-status-action-label__icon"
                  name="icon"
                  slot="icon"
                ></slot>
                ${n$2(this.count, () => n ` ${this.formattedCount} `)}
              </k-profile-stat-badge>
            `)}
        </div>
        <slot part="label"></slot>
      </${this.tag}>
    `;
      }
      handleBlur() {
          this.hasFocus = false;
      }
      handleFocus() {
          this.hasFocus = true;
      }
      handleHostClick(event) {
          if (this.disabled) {
              event.preventDefault();
              event.stopImmediatePropagation();
          }
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Object)
  ], exports.StatusActionLabel.prototype, "count", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.StatusActionLabel.prototype, "disabled", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.StatusActionLabel.prototype, "href", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.StatusActionLabel.prototype, "inline", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.StatusActionLabel.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.StatusActionLabel.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.StatusActionLabel.prototype, "theme", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", String)
  ], exports.StatusActionLabel.prototype, "type", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.StatusActionLabel.prototype, "hasFocus", void 0);
  exports.StatusActionLabel = __decorate([
      customElement('card-status-action-label')
  ], exports.StatusActionLabel);

  var css_248z$8 = i$6`:host{--card-status-action-background-hover:var(--k-color-kong);--card-status-action-background:transparent;--card-status-action-color-hover:var(--k-color-white);--card-status-action-color:var(--k-color-gray-900);--card-status-action-icon-color-active:var(--k-color-kong);--card-status-action-icon-color-hover:var(--k-color-white);--card-status-action-icon-color:var(--k-color-gray-900);--card-status-action-shadow:var(--k-focus-ring-kong-4);display:inline-block}.card-status-action{align-items:center;background-color:var(--card-status-action-background);border:none;border-radius:4px;color:var(--card-status-action-color);display:flex;flex-shrink:0;font-family:var(--k-font-sans);font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-semibold);gap:1px;height:20px;justify-content:center;line-height:var(--k-line-height-sm);line-height:20px;padding:2px 2px 2px 4px}.card-status-action svg{pointer-events:none}.card-status-action--active.card-status-action{--card-status-action-icon-color:var(--card-status-action-icon-color-active)}.card-status-action--active.card-status-action:not(:disabled):hover k-icon::part(background){fill:var(--card-status-action-icon-color-hover)}.card-status-action--active.card-status-action:not(:disabled):hover k-icon::part(foreground){fill:var(--card-status-action-icon-color-active)}.card-status-action--theme-reversed{--card-status-action-color:var(--k-color-white);--card-status-action-icon-color:var(--k-color-white)}.card-status-action k-icon{color:var(--card-status-action-icon-color);pointer-events:none}.card-status-action:not(:disabled):hover{--card-status-action-background:var(--card-status-action-background-hover);--card-status-action-color:var(--card-status-action-color-hover);--card-status-action-icon-color:var(--card-status-action-icon-color-hover);cursor:pointer}.card-status-action:not(:disabled):hover.card-status-action--active{--card-status-action-icon-color:var(--card-status-action-icon-color-hover;)}.card-status-action:focus{outline:0}.card-status-action:focus-visible{box-shadow:var(--card-status-action-shadow)}.card-status-action__count{display:inline-block}.card-status-action__icon--inverted{display:none}`;
  var styles$8 = css_248z$8;
  styleInject(css_248z$8);

  /**
   * @element k-card-status-action
   *
   * @csspart base - The component's base wrapper.
   */
  exports.StatusAction = class StatusAction extends KonstructElement {
      constructor() {
          super(...arguments);
          this.active = false;
          this.count = 0;
          /** The theme to display the status-action in. */
          this.theme = 'reversed';
          this.type = 'like';
      }
      static { this.styles = [KonstructElement.styles, styles$8]; }
      get iconName() {
          return `${this.type}${this.active ? '-applied' : ''}`;
      }
      render() {
          return x `<button class="${classMap('card-status-action', {
            'card-status-action--active': this.active,
            [`card-status-action--theme-${this.theme}`]: this.theme,
        })}" part="base"><div class="card-status-action__count"><slot>${this.count}</slot></div><k-icon class="card-status-action__icon" library="status" name="${this.iconName}"></k-icon></button>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.StatusAction.prototype, "active", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Number)
  ], exports.StatusAction.prototype, "count", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.StatusAction.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.StatusAction.prototype, "type", void 0);
  exports.StatusAction = __decorate([
      customElement('card-status-action')
  ], exports.StatusAction);

  var css_248z$7 = i$6`:host{--game-card-width:100%;--game-card-height:300px;--game-card-background-color:var(--k-color-white);--game-card-color:var(--k-color-gray-900);--game-card-ease-in-out:cubic-bezier(0.4,0,0.2,1);display:flex}.game-card{align-items:flex-start;background:var(--game-card-background-color);border-radius:var(--k-size-6);box-shadow:var(--k-shadow-sm);display:flex;flex-direction:column;flex-shrink:0;height:var(--game-card-height);overflow:hidden;position:relative;transition:all var(--k-transition-slow);width:var(--game-card-width)}.game-card,.game-card a{color:var(--game-card-color)}.game-card a{text-decoration:none}.game-card:hover{box-shadow:var(--k-shadow-xxl);transform:translateY(-6px)}.game-card:hover .game-card__image::slotted(*){transform:scale(1.03)}.game-card:hover .game-card__content--more{grid-template-rows:1fr}.game-card--has-cta .game-card__cta{display:flex}.game-card--theme-reversed{--game-card-background-color:var(--k-color-gray-900);--game-card-color:var(--k-color-white)}.game-card--cover.game-card{--game-card-background-color:transparent;--game-card-color:var(--k-color-white)}.game-card--cover.game-card--has-cta .game-card__tags-container{margin-bottom:4px}.game-card--cover .game-card__content{align-items:flex-start;align-self:stretch;bottom:0;display:flex;flex:1 0 0;flex-direction:column;gap:4px;justify-content:flex-end;overflow:hidden;position:absolute;transform:translateY(calc(100% - 32px));transition:transform var(--k-transition-slow) var(--game-card-ease-in-out);width:100%}.game-card--cover .game-card__content--more{align-self:stretch;display:flex;flex-direction:column;gap:4px;opacity:0;transition-delay:var(--k-transition-fast);transition:opacity var(--k-transition-fast) ease-out}.game-card--cover .game-card__image{inset:0;z-index:0}.game-card--cover .game-card__image:after{background:linear-gradient(180deg,transparent,rgba(0,0,0,.4));content:"";inset:0;position:absolute;z-index:2}.game-card--cover:hover .game-card__content{transform:translateY(0)}.game-card--cover:hover .game-card__content--more{opacity:1}.game-card:not(.game-card--cover) .game-card__content{align-items:flex-start;align-self:stretch;display:flex;flex-direction:column;justify-content:flex-end;width:100%}.game-card:not(.game-card--cover) .game-card__top{align-items:flex-start;align-self:stretch;display:flex;flex-direction:column;gap:10px;justify-content:flex-end;overflow:hidden}.game-card:not(.game-card--cover):not(.game-card--list) .game-card__top{border-radius:16px 16px 0 0;flex:1 0 0;margin-bottom:4px;padding-bottom:6px}.game-card--list:not(.game-card--cover){--game-card-height:120px;flex-direction:row}.game-card--list:not(.game-card--cover) .game-card__description{margin-top:2px}.game-card--list:not(.game-card--cover) .game-card__image{border-radius:0 24px 24px 0;width:120px}.game-card--list:not(.game-card--cover) .game-card__top{border-radius:0 24px 24px 0;flex-shrink:0;padding-bottom:12px;width:120px}.game-card__actions{align-items:flex-start;display:flex}.game-card__byline::slotted(*){align-items:center;display:flex;gap:3px;height:20px}.game-card__content{pointer-events:none;position:relative}.game-card__cta{display:none;flex-grow:1;padding:0 12px;position:relative;width:100%}.game-card__cta::slotted(*){width:100%}.game-card__description{margin-bottom:var(--k-size-1);margin-top:var(--k-size-1);opacity:1;padding:0 var(--k-size-3);transition:opacity var(--k-transition-slow)}.game-card__description-inner{overflow:hidden}.game-card__description-text{-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.game-card__image{display:flex;flex-grow:1;height:100%;inset:0;min-width:120px;overflow:hidden;pointer-events:none;position:absolute;width:100%}.game-card__image::slotted(*){height:100%!important;-o-object-fit:cover;object-fit:cover;-o-object-position:center;object-position:center;position:absolute;transition:all var(--k-transition-slow) ease-in-out;width:100%!important}.game-card__info{align-items:center;align-self:stretch;display:flex;justify-content:space-between;padding:0 8px 6px;position:relative}.game-card__link{inset:0;position:absolute;z-index:0}.game-card__tags::slotted(*){align-items:center;display:flex}.game-card__tags-container{display:flex;flex-direction:row;max-width:100%;overflow:scroll hidden;position:relative;scroll-behavior:smooth;scroll-snap-stop:normal;scroll-snap-type:x mandatory;-moz-scrollbar-width:none;-ms-scrollbar-width:none;-webkit-scrollbar-width:none;scrollbar-width:none;width:100%}.game-card__tags-container::-webkit-scrollbar{display:none;width:0!important}.game-card__title{opacity:1;padding:0 var(--k-size-3);transition:opacity var(--k-transition-slow)}.game-card__title-inner{-webkit-line-clamp:1;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.game-card__top{pointer-events:none;position:relative}`;
  var styles$7 = css_248z$7;
  styleInject(css_248z$7);

  /**
   * @element k-game-card
   *
   * @csspart base - The component's base wrapper.
   * @csspart action - Card actions.
   * @csspart cta - The component's call to action, such as a "Play Now" button.
   * @csspart byline â€“ A container for byline info.
   * @csspart image â€“ The primary card image.
   * @csspart tags - The tags container.
   *
   * @cssproperty --game-card-width - The width of the game card.
   * @cssproperty --game-card-height - The height of the game card.
   * @cssproperty --game-card-background-color - The background color of the game card.
   * @cssproperty --game-card-color - The text color of the game card.
   */
  exports.GameCard = class GameCard extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$7]; }
      constructor() {
          super();
          /** Expands the card image to cover the entire card area. */
          this.cover = false;
          /** Styles the card suitable for list views. */
          this.list = false;
          /** The theme to display the game-card in. */
          this.theme = 'reversed';
          this.hasSlotController = new HasSlotController(this, 'cta');
          this.actionsSlotController = new SlotController(this, {
              allow: [exports.StatusAction],
              forwardAttrs: ['theme'],
              setAttrs: () => ({
                  theme: this.cover ? 'reversed' : this.theme,
              }),
              slots: ['action'],
          });
          this.ctaSlotController = new SlotController(this, {
              allow: [exports.ActionButton],
              forwardAttrs: ['theme'],
              setAttrs: () => ({
                  theme: this.ctaTheme,
              }),
              slots: ['cta'],
          });
          this.addController(this.actionsSlotController);
          this.addController(this.ctaSlotController);
      }
      get ctaTheme() {
          if (this.cover) {
              return this.theme;
          }
          else {
              return this.theme === 'default' ? 'reversed' : 'default';
          }
      }
      render() {
          return x `<article class="${classMap({
            'game-card': true,
            'game-card--cover': this.cover,
            'game-card--has-cta': this.hasSlotController.test('cta'),
            'game-card--list': this.list,
            [`game-card--theme-${this.theme}`]: true,
        })}" part="base">${n$2(this.href, () => x `<a class="game-card__link" href="${l$2(this.href)}" target="${l$2(this.target)}"><div class="sr-only">Visit Game</div></a>`)} ${n$2(this.cover, () => x `${this.renderImage()}<div class="game-card__content">${this.renderTitle()}<div class="game-card__content--more">${this.renderTags()} ${this.renderCta()}<div class="game-card__info">${this.renderByline()} ${this.renderActions()}</div></div></div>`, () => x `<div class="game-card__top">${this.renderImage()} ${this.renderTags()}</div><div class="game-card__content">${this.renderTitle()} ${this.renderDescription()} ${this.renderCta()}<div class="game-card__info">${this.renderByline()} ${this.renderActions()}</div></div>`)}</article>`;
      }
      renderActions() {
          return x `<slot class="game-card__actions" name="action" part="action"></slot>`;
      }
      renderByline() {
          return x `<slot class="game-card__byline" name="byline" part="byline"></slot>`;
      }
      renderCta() {
          return x `<slot class="game-card__cta" name="cta" part="cta"></slot>`;
      }
      renderDescription() {
          return x `<div class="game-card__description"><div class="game-card__description-inner"><k-text ?xs="${!this.list}" ?sm="${this.list}" regular class="game-card__description-text" tag="p"><slot name="description">${this.description}</slot></k-text></div></div>`;
      }
      renderImage() {
          return x `<slot class="game-card__image" name="image" part="image"></slot>`;
      }
      renderTags() {
          return x `<div class="game-card__tags-container"><slot class="game-card__tags" name="tags" part="tags"></slot></div>`;
      }
      renderTitle() {
          return x `<div class="game-card__title" part="title"><div class="game-card__title-inner"><k-text sm semibold tag="h1"><slot name="title">${this.title}</slot></k-text></div></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.GameCard.prototype, "cover", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.GameCard.prototype, "description", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.GameCard.prototype, "list", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.GameCard.prototype, "href", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.GameCard.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.GameCard.prototype, "theme", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.GameCard.prototype, "title", void 0);
  exports.GameCard = __decorate([
      customElement('game-card'),
      __metadata("design:paramtypes", [])
  ], exports.GameCard);

  var css_248z$6 = i$6`:host{--badge-card-height:180px;--badge-card-width:100%;display:inline-flex}.badge-card{align-items:flex-start;background:var(--k-color-gray-800);border-radius:24px;box-shadow:var(--k-shadow-sm);color:var(--k-color-white);display:flex;flex-direction:column;gap:8px;height:var(--badge-card-height);padding:12px;width:var(--badge-card-width)}.badge-card__badge{background:var(--k-color-gray-50);border:1px solid var(--k-color-gray-500);border-radius:12px;height:64px;overflow:hidden;position:relative;width:64px}.badge-card__badge img{height:100%;-o-object-fit:cover;object-fit:cover;position:absolute;width:100%}.badge-card__content{flex:1 0 0;flex-direction:column;gap:4px}.badge-card__content,.badge-card__top{align-items:flex-start;align-self:stretch;display:flex}.badge-card__top{gap:8px;justify-content:space-between}`;
  var styles$6 = css_248z$6;
  styleInject(css_248z$6);

  /**
   * @element k-badge-card
   *
   * @slot - The default slot for text content.
   *
   * @csspart base - The component's base wrapper.
   * @csspart title - The badge title.
   * @csspart description - The description of the badge.
   *
   * @cssproperty --badge-card-height - The height of the badge card.
   * @cssproperty --badge-card-width - The width of the badge card.
   */
  exports.BadgeCard = class BadgeCard extends KonstructElement {
      constructor() {
          super(...arguments);
          this.description = '';
          this.points = 0;
          this.src = '';
          this.title = '';
      }
      static { this.styles = [KonstructElement.styles, styles$6]; }
      get formattedPoints() {
          return String(this.points).padStart(2, '0');
      }
      render() {
          return x `<article class="${classMap({
            'badge-card': true,
        })}" part="base"><div class="badge-card__top"><div class="badge-card__badge">${n$2(this.src, () => x `<img src="${this.src}" alt="">`, () => x `<img src="/storybook/assets/cards/game-card-cover.png" alt="">`)}</div><k-text md semibold>${this.formattedPoints}</k-text></div><div class="badge-card__content"><k-text part="title" sm semibold tag="h1">${this.title}</k-text><k-text class="badge-card__description" part="description" tag="p" xs><slot>${this.description}</slot></k-text></div></article>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.BadgeCard.prototype, "description", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Number,
      }),
      __metadata("design:type", Number)
  ], exports.BadgeCard.prototype, "points", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.BadgeCard.prototype, "src", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.BadgeCard.prototype, "title", void 0);
  exports.BadgeCard = __decorate([
      customElement('badge-card')
  ], exports.BadgeCard);

  var css_248z$5 = i$6`:host{display:flex}.card-action-button{--card-action-button-background:var(--k-color-gray-100);--card-action-button-color:var(--k-color-gray-900);--card-action-button-padding:8px 12px;align-items:center;background:var(--card-action-button-background);border-radius:6px;border-style:none;color:var(--card-action-button-color);display:inline-flex;font-size:var(--k-font-size-md);font-weight:700;gap:8px;line-height:var(--k-line-height-md);padding:var(--card-action-button-padding)}.card-action-button--action-more.card-action-button{--card-action-button-background:transparent}.card-action-button--action-more.card-action-button:hover{--card-action-button-background:var(--k-color-gray-100)}.card-action-button--applied{--card-action-button-background:var(--k-gradient-kong-45);--card-action-button-color:var(--k-color-white)}.card-action-button--mini{padding:9px}.card-action-button--mini .card-action-button__label{display:none}.card-action-button:hover{--card-action-button-background:var(--k-color-gray-200)}.card-action-button:focus{outline:0}.card-action-button:focus-visible{box-shadow:var(--k-focus-ring-kong-4)}.card-action-button:not(:disabled){cursor:pointer}.card-action-button__icon{font-size:22px}.card-action-button__icon k-icon{pointer-events:none}`;
  var styles$5 = css_248z$5;
  styleInject(css_248z$5);

  /**
   * @element k-card-action-button
   *
   * @csspart base - The component's base wrapper.
   *
   * @event k-focus - Dispatched when the button is focused.
   * @event k-blur - Dispatched when the button is blurred.
   * @event k-click - Dispatched when the button is clicked.
   */
  exports.CardActionButton = class CardActionButton extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The button action type. */
          this.action = 'favorite';
          /** If the button has been applied. */
          this.applied = false;
          /** If the button is only an icon. */
          this.mini = false;
          this.hasFocus = false;
      }
      static { this.styles = [KonstructElement.styles, styles$5]; }
      get iconMapping() {
          const mappings = {
              collection: 'artifact',
              favorite: 'favorite',
              follow: 'follow',
              more: 'more',
              pin: 'pin',
          };
          return `${mappings[this.action]}-applied`;
      }
      render() {
          return x `<button class="${classMap({
            'card-action-button': true,
            'card-action-button--applied': this.applied,
            'card-action-button--mini': this.mini,
            [`card-action-button--action-${this.action}`]: true,
        })}" part="base" type="button" @blur="${this.handleBlur}" @click="${this.handleClick}" @focus="${this.handleFocus}"><slot name="icon" class="card-action-button__icon"><k-icon library="status" name="${this.iconMapping}"></k-icon></slot><slot class="card-action-button__label"></slot></button>`;
      }
      handleBlur() {
          this.hasFocus = false;
          const blurEvent = new CustomEvent(K_BLUR_EVENT);
          this.dispatchEvent(blurEvent);
      }
      handleClick() {
          const clickEvent = new CustomEvent(K_CLICK_EVENT, {
              bubbles: true,
              composed: true,
          });
          this.dispatchEvent(clickEvent);
      }
      handleFocus() {
          this.hasFocus = true;
          const focusEvent = new CustomEvent(K_FOCUS_EVENT);
          this.dispatchEvent(focusEvent);
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.CardActionButton.prototype, "action", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.CardActionButton.prototype, "applied", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.CardActionButton.prototype, "mini", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.CardActionButton.prototype, "hasFocus", void 0);
  exports.CardActionButton = __decorate([
      customElement('card-action-button')
  ], exports.CardActionButton);

  var css_248z$4 = i$6`:host{--card-byline-background:transparent;--card-byline-color:var(--k-color-gray-900);--card-byline-focus-background:var(--k-color-sheer-black-50);--card-byline-focus-color:var(--k-color-gray-900);align-items:center;display:flex;justify-content:flex-start;position:relative}.card-byline{align-items:center;background:var(--card-byline-background);border-style:none;color:var(--card-byline-color);display:inline-flex;flex-shrink:0;gap:3px;height:20px;padding:0;position:relative;text-decoration:none;width:auto}.card-byline--mini{border-radius:10px 0 0 10px}.card-byline--mini .card-byline__avatar{padding-right:3px}.card-byline--mini:not(:focus-visible) .card-byline__label{border-radius:0 4px 4px 0;display:none;height:20px;left:20px;padding-left:3px;position:absolute}.card-byline--mini:not(:disabled):hover{cursor:pointer}.card-byline--mini:not(:disabled):hover .card-byline__label{background:var(--card-byline-background);display:flex}.card-byline--theme-reversed{--card-byline-color:var(--k-color-white);--card-byline-focus-background:var(--k-color-sheer-black-50);--card-byline-focus-color:var(--k-color-white)}.card-byline--variant-developer{border-radius:10px 4px 4px 10px}.card-byline--variant-game{border-radius:4px}.card-byline--variant-game .card-byline__avatar::slotted(*){background:red;border-radius:4px;overflow:hidden}.card-byline:not(:disabled):hover{--card-byline-background:var(--k-color-kong);--card-byline-color:var(--k-color-white);cursor:pointer}.card-byline:focus{outline:0}.card-byline:not(:disabled):focus-visible{--card-byline-background:var(--card-byline-focus-background);--card-byline-color:var(--card-byline-focus-color);border-bottom-right-radius:4px;border-top-right-radius:4px;box-shadow:var(--k-focus-ring-kong-4)}.card-byline:not(:disabled):focus-visible .card-byline__avatar{padding-right:0}.card-byline:not(:disabled):focus-visible .card-byline__label{background:0 0}.card-byline__avatar{display:flex;pointer-events:none}.card-byline__avatar::slotted(*){pointer-events:none}.card-byline__inner-wrap{display:flex}.card-byline__label{display:flex;font-size:var(--k-font-size-sm);font-weight:var(--k-font-weight-semibold);line-height:var(--k-line-height-sm);padding-right:4px}.card-byline__label::slotted(*){pointer-events:none}`;
  var styles$4 = css_248z$4;
  styleInject(css_248z$4);

  /**
   * @element k-card-byline
   *
   * @slot - The card byline text.
   * @slot avatar - The card byline avatar.
   *
   * @csspart base - The component's base wrapper.
   * @csspart avatar - The card byline avatar.
   * @csspart label - The card byline label.
   *
   * @cssproperty --card-byline-background - The card byline background.
   * @cssproperty --card-byline-color - The card byline text color.
   * @cssproperty --card-byline-focus-background - The card byline background color when focused.
   * @cssproperty --card-byline-focus-color - The card byline text color when focused.
   */
  exports.CardByline = class CardByline extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$4]; }
      constructor() {
          super();
          /** Disables the button. */
          this.disabled = false;
          /** The theme to display the card-byline in. */
          this.theme = 'reversed';
          /**
           * The button type. Defaults to "button".
           */
          this.type = 'button';
          /** The byline variant. */
          this.variant = 'developer';
          /** If the byline is a mini version. */
          this.mini = false;
          this.hasFocus = false;
          this.hrefAttribute = i `href`;
          this.addController(new SlotController(this, {
              allow: [exports.Avatar],
              setAttrs: () => ({
                  rounded: this.variant === 'developer',
                  size: '20',
              }),
              slots: ['avatar'],
          }));
      }
      get isLink() {
          return this.href ? true : false;
      }
      get tag() {
          if (this.isLink) {
              return i `a`;
          }
          else {
              return i `button`;
          }
      }
      render() {
          return n `
      <${this.tag}
        class=${classMap({
            'card-byline': true,
            'card-byline--focused': this.hasFocus,
            'card-byline--mini': this.mini,
            [`card-byline--variant-${this.variant}`]: true,
            [`card-byline--theme-${this.theme}`]: true,
        })}
        ?disabled=${this.isLink ? undefined : this.disabled}
        ${this.hrefAttribute}=${l$2(this.href)}
        part="base"
        target=${l$2(this.target)}
        type=${l$2(this.isLink ? undefined : this.type)}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
      >
        <slot
          class="card-byline__avatar"
          name="avatar"
          part="avatar"
        ></slot>

        <slot class="card-byline__label" part="label">
        </slot>
      </${this.tag}>
    `;
      }
      handleBlur() {
          this.hasFocus = false;
      }
      handleFocus() {
          this.hasFocus = true;
      }
  };
  __decorate([
      n$5({ reflect: true, type: Boolean }),
      __metadata("design:type", Object)
  ], exports.CardByline.prototype, "disabled", void 0);
  __decorate([
      n$5({ reflect: true, type: String }),
      __metadata("design:type", String)
  ], exports.CardByline.prototype, "href", void 0);
  __decorate([
      n$5({ reflect: true, type: String }),
      __metadata("design:type", String)
  ], exports.CardByline.prototype, "target", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.CardByline.prototype, "theme", void 0);
  __decorate([
      n$5(),
      __metadata("design:type", String)
  ], exports.CardByline.prototype, "type", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.CardByline.prototype, "variant", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.CardByline.prototype, "mini", void 0);
  __decorate([
      t(),
      __metadata("design:type", Object)
  ], exports.CardByline.prototype, "hasFocus", void 0);
  exports.CardByline = __decorate([
      customElement('card-byline'),
      __metadata("design:paramtypes", [])
  ], exports.CardByline);

  var css_248z$3 = i$6`:host{display:inline-flex}:host([color=error]){--k-badge-background-color:var(--k-color-error-50);--k-badge-color:var(--k-color-error-700)}:host([color=orange]){--k-badge-background-color:var(--k-color-orange-50);--k-badge-color:var(--k-color-orange-700)}:host([color=rose]){--k-badge-background-color:var(--k-color-rose-50);--k-badge-color:var(--k-color-rose-700)}:host([color=pink]){--k-badge-background-color:var(--k-color-pink-50);--k-badge-color:var(--k-color-pink-700)}:host([color=blue]){--k-badge-background-color:var(--k-color-blue-50);--k-badge-color:var(--k-color-blue-700)}:host([color=purple]){--k-badge-background-color:var(--k-color-purple-50);--k-badge-color:var(--k-color-purple-700)}:host([color=indigo]){--k-badge-background-color:var(--k-color-indigo-50);--k-badge-color:var(--k-color-indigo-700)}:host([color=blue-light]){--k-badge-background-color:var(--k-color-blue-light-50);--k-badge-color:var(--k-color-blue-light-700)}:host([color=gray-blue]){--k-badge-background-color:var(--k-color-gray-blue-50);--k-badge-color:var(--k-color-gray-blue-700)}:host([color=success]){--k-badge-background-color:var(--k-color-success-50);--k-badge-color:var(--k-color-success-700)}:host([color=warning]){--k-badge-background-color:var(--k-color-warning-50);--k-badge-color:var(--k-color-warning-700)}:host([color=gray]){--k-badge-background-color:var(--k-color-gray-100);--k-badge-color:var(--k-color-gray-700)}:host([color=primary]){--k-badge-background-color:var(--k-color-gray-50);--k-badge-color:var(--k-color-gray-700)}.badge{align-items:center;background-color:var(--k-badge-background-color);border-radius:4px;color:var(--k-badge-color);display:flex;justify-content:center}.badge--size-sm{font-size:var(--k-font-size-xs);height:22px;padding-left:6px;padding-right:6px}.badge--size-md{font-size:var(--k-font-size-sm);height:24px;padding-left:8px;padding-right:8px}.badge--size-lg{font-size:var(--k-font-size-sm);height:28px;padding-left:12px;padding-right:12px}`;
  var styles$3 = css_248z$3;
  styleInject(css_248z$3);

  /**
   * @element k-badge
   *
   * @csspart base - The component's base wrapper.
   */
  exports.Badge = class Badge extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles$3]; }
      constructor() {
          super();
          /**
           * The color of the badge. Changes both the background-color
           * and the text color.
           */
          this.color = 'gray';
          /** The content of the badge. */
          this.content = '';
          /** The size of the badge. */
          this.size = 'md';
          this.addController(new SlotController(this, {
              allow: [HTMLDivElement],
              slots: 'default',
          }));
      }
      render() {
          return x `<div class="${classMap('badge', `badge--size-${this.size}`)}" part="base"><slot name="leading"></slot><slot>${this.content}</slot><slot name="trailing"></slot></div>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Badge.prototype, "color", void 0);
  __decorate([
      n$5({ reflect: true, type: String }),
      __metadata("design:type", Object)
  ], exports.Badge.prototype, "content", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.Badge.prototype, "size", void 0);
  exports.Badge = __decorate([
      customElement('badge'),
      __metadata("design:paramtypes", [])
  ], exports.Badge);

  var css_248z$2 = i$6`:host{display:flex}.profile-stat{align-items:center;background:var(--profile-stat-background);border-radius:var(--profile-stat-border-radius);box-shadow:var(--profile-stat-shadow);color:var(--profile-stat-color);display:inline-flex;flex-shrink:0;gap:var(--profile-stat-gap);height:var(--profile-stat-height);justify-content:center;max-width:var(--profile-stat-max-width,auto);min-width:var(--profile-stat-min-width);padding:var(--profile-stat-padding)}.profile-stat--size-sm{--profile-stat-border-radius:5px;--profile-stat-font-size:16px;--profile-stat-gap:0px;--profile-stat-height:24px;--profile-stat-icon-size:16px;--profile-stat-letter-spacing:-0.96px;--profile-stat-min-width:24px;--profile-stat-shadow:var(--k-shadow-sm)}.profile-stat--size-sm:not(.profile-stat--icon-only){--profile-stat-padding:2.5px 3px 2.5px 2px}.profile-stat--size-sm--icon-only{--profile-stat-max-width:24px;--profile-stat-padding:4px 5px}.profile-stat--size-md{--profile-stat-border-radius:6px;--profile-stat-font-size:20px;--profile-stat-gap:0px;--profile-stat-height:28px;--profile-stat-icon-size:18px;--profile-stat-letter-spacing:-1.2px;--profile-stat-min-width:28px;--profile-stat-shadow:var(--k-shadow-sm)}.profile-stat--size-md:not(.profile-stat--icon-only){--profile-stat-padding:2.5px 3px 2.5px 2px}.profile-stat--size-md--icon-only{--profile-stat-max-width:28px;--profile-stat-padding:5px 6px}.profile-stat--size-lg{--profile-stat-border-radius:8px;--profile-stat-font-size:32px;--profile-stat-gap:1px;--profile-stat-height:36px;--profile-stat-icon-size:24px;--profile-stat-letter-spacing:-1.92px;--profile-stat-min-width:36px;--profile-stat-shadow:var(--k-shadow-md)}.profile-stat--size-lg:not(.profile-stat--icon-only){--profile-stat-padding:3.5px 4px 3.5px 2px}.profile-stat--size-lg--icon-only{--profile-stat-max-width:36px;--profile-stat-padding:6px}.profile-stat--theme-default{--profile-stat-background:var(--k-color-white);--profile-stat-color:var(--k-color-gray-900);--profile-stat-font-weight:700}.profile-stat--theme-reversed{--profile-stat-background:var(--k-color-gray-900);--profile-stat-color:var(--k-color-white);--profile-stat-font-weight:600}.profile-stat--icon-only .profile-stat__label{display:none}.profile-stat__icon{color:var(--k-color-kong);display:flex;font-size:var(--profile-stat-icon-size)}.profile-stat__label{display:flex;font-size:var(--profile-stat-font-size);font-weight:var(--profile-stat-font-weight);letter-spacing:var(--profile-stat-letter-spacing);text-align:center}`;
  var styles$2 = css_248z$2;
  styleInject(css_248z$2);

  /**
   * @element k-profile-stat-badge
   *
   * @csspart base - The component's base wrapper.
   */
  exports.ProfileStat = class ProfileStat extends KonstructElement {
      constructor() {
          super(...arguments);
          /** Display only an icon */
          this.iconOnly = false;
          /** The size of the profile stat badge. */
          this.size = 'sm';
          /** The theme to display the profile-stat in. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$2]; }
      render() {
          return x `<div class="${classMap({
            'profile-stat': true,
            'profile-stat--icon-only': this.iconOnly,
            [`profile-stat--size-${this.size}`]: true,
            [`profile-stat--theme-${this.theme}`]: true,
        })}" part="base"><slot class="profile-stat__icon" name="icon"></slot><slot class="profile-stat__label"></slot></div>`;
      }
  };
  __decorate([
      n$5({
          attribute: 'icon-only',
          reflect: true,
          type: Boolean,
      }),
      __metadata("design:type", Object)
  ], exports.ProfileStat.prototype, "iconOnly", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ProfileStat.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.ProfileStat.prototype, "theme", void 0);
  exports.ProfileStat = __decorate([
      customElement('profile-stat-badge')
  ], exports.ProfileStat);

  var css_248z$1 = i$6`:host{display:flex}.carousel-arrow{align-items:center;background:var(--k-color-white);border-style:none;color:var(--k-color-gray-900);display:inline-flex;gap:12px;justify-content:center}.carousel-arrow:hover:not(:disabled){background:var(--k-color-kong);color:var(--k-color-white);cursor:pointer}.carousel-arrow--size-md{border-radius:18px;font-size:32px;height:36px;padding:2px;width:36px}.carousel-arrow--size-md .carousel-arrow__icon{height:32px;width:32px}.carousel-arrow--size-lg{border-radius:22px;font-size:36px;height:44px;padding:4px;width:44px}.carousel-arrow--size-lg .carousel-arrow__icon{height:36px;width:36px}.carousel-arrow--theme-reversed{background:var(--k-color-gray-800);color:var(--k-color-white)}.carousel-arrow:focus{outline:0}.carousel-arrow:not(:disabled):focus-visible{box-shadow:var(--k-focus-ring-kong-4)}.carousel-arrow__icon{align-items:center;display:flex;flex-shrink:0;justify-content:center}`;
  var styles$1 = css_248z$1;
  styleInject(css_248z$1);

  /**
   * @element k-carousel-arrow
   *
   * @csspart base - The component's base wrapper.
   */
  exports.CarouselArrow = class CarouselArrow extends KonstructElement {
      constructor() {
          super(...arguments);
          /** The direction of the arrow. */
          this.direction = 'right';
          /** The size of the carousel arrow. */
          this.size = 'md';
          /** The theme to display the carousel-arrow in. */
          this.theme = 'reversed';
      }
      static { this.styles = [KonstructElement.styles, styles$1]; }
      render() {
          return x `<button class="${classMap({
            'carousel-arrow': true,
            [`carousel-arrow--direction-${this.direction}`]: true,
            [`carousel-arrow--size-${this.size}`]: true,
            [`carousel-arrow--theme-${this.theme}`]: true,
        })}" part="base" type="button">${n$2(this.direction === 'left', () => x `<svg class="carousel-arrow__icon" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.2875 26.9999L11.25 17.9624L20.2875 8.92493L21.9 10.5374L14.475 17.9624L21.9 25.3874L20.2875 26.9999Z" fill="currentColor"/></svg>`, () => x `<svg class="carousel-arrow__icon" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8625 26.9999L14.25 25.3874L21.675 17.9624L14.25 10.5374L15.8625 8.92493L24.9 17.9624L15.8625 26.9999Z" fill="currentColor"/></svg>`)}</button>`;
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.CarouselArrow.prototype, "direction", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.CarouselArrow.prototype, "size", void 0);
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.CarouselArrow.prototype, "theme", void 0);
  exports.CarouselArrow = __decorate([
      customElement('carousel-arrow')
  ], exports.CarouselArrow);

  var css_248z = i$6`:host{--ticker-banner-gap:10px;--ticker-banner-speed:20s;display:block;font-family:Edit Undo BRK Regular,sans-serif}:host ::slotted(*),:host slot{font-family:inherit}@keyframes scroll{0%{transform:translateX(0);visibility:visible}to{transform:translateX(-100%)}}.ticker-banner{align-items:center;box-sizing:content-box;display:flex;height:32px;overflow:hidden;position:relative;width:100%}.ticker-banner__ticker{animation:scroll var(--ticker-banner-speed) linear infinite;box-sizing:content-box;cursor:pointer;display:flex;height:30px;line-height:30px;padding-left:100%;white-space:nowrap}.ticker-banner__ticker-item{display:inline-block;font-size:var(--k-font-size-xl);line-height:var(--k-line-height-xl);pointer-events:none;text-transform:uppercase}.ticker-banner__ticker-item:after{content:"//";display:inline-flex;padding-left:var(--ticker-banner-gap);padding-right:var(--ticker-banner-gap)}.ticker-banner__ticker-item:last-child:after{content:""}.ticker-banner--theme-info{background-color:var(--k-color-blue-dark-300);color:var(--k-color-blue-dark-900)}.ticker-banner--theme-warning{background-color:var(--k-color-warning-400);color:var(--k-color-warning-900)}.ticker-banner--theme-urgent{background-color:var(--k-color-error-400);color:var(--k-color-error-900)}@media (prefers-reduced-motion:reduce){.ticker-banner__ticker{animation-play-state:paused!important;display:flex;justify-content:center;padding-left:0}}`;
  var styles = css_248z;
  styleInject(css_248z);

  /**
   * @element k-ticker-banner
   *
   * @csspart base - The component's base wrapper.
   * @csspart content - The component's content wrapper.
   */
  exports.TickerBanner = class TickerBanner extends KonstructElement {
      static { this.styles = [KonstructElement.styles, styles]; }
      constructor() {
          super();
          /** The theme to display the ticker-banner in. */
          this.theme = 'info';
          this.loadFont(new FontFace('Edit Undo BRK Regular', `url('${KONSTRUCT_ASSETS_PATH}/fonts/edit-undo-brk/edit-undo-brk.woff')`));
      }
      get windowWidth() {
          return window.innerWidth;
      }
      render() {
          return x `<div class="${classMap({
            'ticker-banner': true,
            [`ticker-banner--theme-${this.theme}`]: true,
        })}" part="base"><div class="ticker-banner__ticker"><div class="ticker-banner__ticker-item"><slot class="ticker-banner__content" part="content" @slotchange="${this.handleSlotChange}"></slot></div></div></div>`;
      }
      handleSlotChange() {
          this.removeDuplicateContent();
          this.duplicateContent();
      }
      duplicateContent() {
          const slotText = this._contentNodes
              .map((node) => {
              return node.textContent ? node.textContent : '';
          })
              .join('');
          let contentWidth = this.item.offsetWidth;
          while (contentWidth < this.windowWidth) {
              const copy = document.createElement('div');
              copy.textContent = slotText;
              copy.classList.add('ticker-banner__ticker-item', 'ticker-banner__ticker-item--duplicate');
              copy.setAttribute('aria-hidden', '');
              this.ticker.appendChild(copy);
              contentWidth += contentWidth;
          }
      }
      removeDuplicateContent() {
          const duplicates = this.ticker.querySelectorAll('.ticker-banner__ticker-item--duplicate');
          duplicates.forEach((element) => {
              this.ticker.removeChild(element);
          });
      }
  };
  __decorate([
      n$5({
          reflect: true,
          type: String,
      }),
      __metadata("design:type", String)
  ], exports.TickerBanner.prototype, "theme", void 0);
  __decorate([
      i$2('.ticker-banner__ticker'),
      __metadata("design:type", HTMLElement)
  ], exports.TickerBanner.prototype, "ticker", void 0);
  __decorate([
      i$2('.ticker-banner__ticker-item'),
      __metadata("design:type", HTMLElement)
  ], exports.TickerBanner.prototype, "item", void 0);
  __decorate([
      o$4({ flatten: true }),
      __metadata("design:type", Array)
  ], exports.TickerBanner.prototype, "_contentNodes", void 0);
  exports.TickerBanner = __decorate([
      customElement('ticker-banner'),
      __metadata("design:paramtypes", [])
  ], exports.TickerBanner);

  exports.FormCheckboxController = FormCheckboxController;
  exports.FormElement = FormElement;
  exports.FormFieldController = FormFieldController;
  exports.FormInputController = FormInputController;
  exports.InputFieldBase = InputFieldBase;
  exports.KongpanionController = KongpanionController;

  return exports;

})({});

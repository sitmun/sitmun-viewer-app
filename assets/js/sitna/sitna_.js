/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
const r=n(7564),o=n(3320),i="function"==typeof Symbol&&"function"==typeof Symbol.for?Symbol.for("nodejs.util.inspect.custom"):null;e.lW=l,e.h2=50;const a=2147483647;function s(t){if(t>a)throw new RangeError('The value "'+t+'" is invalid for option "size"');const e=new Uint8Array(t);return Object.setPrototypeOf(e,l.prototype),e}function l(t,e,n){if("number"==typeof t){if("string"==typeof e)throw new TypeError('The "string" argument must be of type string. Received type number');return p(t)}return c(t,e,n)}function c(t,e,n){if("string"==typeof t)return function(t,e){"string"==typeof e&&""!==e||(e="utf8");if(!l.isEncoding(e))throw new TypeError("Unknown encoding: "+e);const n=0|m(t,e);let r=s(n);const o=r.write(t,e);o!==n&&(r=r.slice(0,o));return r}(t,e);if(ArrayBuffer.isView(t))return function(t){if(K(t,Uint8Array)){const e=new Uint8Array(t);return h(e.buffer,e.byteOffset,e.byteLength)}return d(t)}(t);if(null==t)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof t);if(K(t,ArrayBuffer)||t&&K(t.buffer,ArrayBuffer))return h(t,e,n);if("undefined"!=typeof SharedArrayBuffer&&(K(t,SharedArrayBuffer)||t&&K(t.buffer,SharedArrayBuffer)))return h(t,e,n);if("number"==typeof t)throw new TypeError('The "value" argument must not be of type number. Received type number');const r=t.valueOf&&t.valueOf();if(null!=r&&r!==t)return l.from(r,e,n);const o=function(t){if(l.isBuffer(t)){const e=0|f(t.length),n=s(e);return 0===n.length||t.copy(n,0,0,e),n}if(void 0!==t.length)return"number"!=typeof t.length||X(t.length)?s(0):d(t);if("Buffer"===t.type&&Array.isArray(t.data))return d(t.data)}(t);if(o)return o;if("undefined"!=typeof Symbol&&null!=Symbol.toPrimitive&&"function"==typeof t[Symbol.toPrimitive])return l.from(t[Symbol.toPrimitive]("string"),e,n);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof t)}function u(t){if("number"!=typeof t)throw new TypeError('"size" argument must be of type number');if(t<0)throw new RangeError('The value "'+t+'" is invalid for option "size"')}function p(t){return u(t),s(t<0?0:0|f(t))}function d(t){const e=t.length<0?0:0|f(t.length),n=s(e);for(let r=0;r<e;r+=1)n[r]=255&t[r];return n}function h(t,e,n){if(e<0||t.byteLength<e)throw new RangeError('"offset" is outside of buffer bounds');if(t.byteLength<e+(n||0))throw new RangeError('"length" is outside of buffer bounds');let r;return r=void 0===e&&void 0===n?new Uint8Array(t):void 0===n?new Uint8Array(t,e):new Uint8Array(t,e,n),Object.setPrototypeOf(r,l.prototype),r}function f(t){if(t>=a)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a.toString(16)+" bytes");return 0|t}function m(t,e){if(l.isBuffer(t))return t.length;if(ArrayBuffer.isView(t)||K(t,ArrayBuffer))return t.byteLength;if("string"!=typeof t)throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof t);const n=t.length,r=arguments.length>2&&!0===arguments[2];if(!r&&0===n)return 0;let o=!1;for(;;)switch(e){case"ascii":case"latin1":case"binary":return n;case"utf8":case"utf-8":return V(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*n;case"hex":return n>>>1;case"base64":return z(t).length;default:if(o)return r?-1:V(t).length;e=(""+e).toLowerCase(),o=!0}}function g(t,e,n){let r=!1;if((void 0===e||e<0)&&(e=0),e>this.length)return"";if((void 0===n||n>this.length)&&(n=this.length),n<=0)return"";if((n>>>=0)<=(e>>>=0))return"";for(t||(t="utf8");;)switch(t){case"hex":return x(this,e,n);case"utf8":case"utf-8":return T(this,e,n);case"ascii":return A(this,e,n);case"latin1":case"binary":return O(this,e,n);case"base64":return L(this,e,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return I(this,e,n);default:if(r)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),r=!0}}function y(t,e,n){const r=t[e];t[e]=t[n],t[n]=r}function v(t,e,n,r,o){if(0===t.length)return-1;if("string"==typeof n?(r=n,n=0):n>2147483647?n=2147483647:n<-2147483648&&(n=-2147483648),X(n=+n)&&(n=o?0:t.length-1),n<0&&(n=t.length+n),n>=t.length){if(o)return-1;n=t.length-1}else if(n<0){if(!o)return-1;n=0}if("string"==typeof e&&(e=l.from(e,r)),l.isBuffer(e))return 0===e.length?-1:_(t,e,n,r,o);if("number"==typeof e)return e&=255,"function"==typeof Uint8Array.prototype.indexOf?o?Uint8Array.prototype.indexOf.call(t,e,n):Uint8Array.prototype.lastIndexOf.call(t,e,n):_(t,[e],n,r,o);throw new TypeError("val must be string, number or Buffer")}function _(t,e,n,r,o){let i,a=1,s=t.length,l=e.length;if(void 0!==r&&("ucs2"===(r=String(r).toLowerCase())||"ucs-2"===r||"utf16le"===r||"utf-16le"===r)){if(t.length<2||e.length<2)return-1;a=2,s/=2,l/=2,n/=2}function c(t,e){return 1===a?t[e]:t.readUInt16BE(e*a)}if(o){let r=-1;for(i=n;i<s;i++)if(c(t,i)===c(e,-1===r?0:i-r)){if(-1===r&&(r=i),i-r+1===l)return r*a}else-1!==r&&(i-=i-r),r=-1}else for(n+l>s&&(n=s-l),i=n;i>=0;i--){let n=!0;for(let r=0;r<l;r++)if(c(t,i+r)!==c(e,r)){n=!1;break}if(n)return i}return-1}function C(t,e,n,r){n=Number(n)||0;const o=t.length-n;r?(r=Number(r))>o&&(r=o):r=o;const i=e.length;let a;for(r>i/2&&(r=i/2),a=0;a<r;++a){const r=parseInt(e.substr(2*a,2),16);if(X(r))return a;t[n+a]=r}return a}function E(t,e,n,r){return Y(V(e,t.length-n),t,n,r)}function w(t,e,n,r){return Y(function(t){const e=[];for(let n=0;n<t.length;++n)e.push(255&t.charCodeAt(n));return e}(e),t,n,r)}function S(t,e,n,r){return Y(z(e),t,n,r)}function b(t,e,n,r){return Y(function(t,e){let n,r,o;const i=[];for(let a=0;a<t.length&&!((e-=2)<0);++a)n=t.charCodeAt(a),r=n>>8,o=n%256,i.push(o),i.push(r);return i}(e,t.length-n),t,n,r)}function L(t,e,n){return 0===e&&n===t.length?r.fromByteArray(t):r.fromByteArray(t.slice(e,n))}function T(t,e,n){n=Math.min(t.length,n);const r=[];let o=e;for(;o<n;){const e=t[o];let i=null,a=e>239?4:e>223?3:e>191?2:1;if(o+a<=n){let n,r,s,l;switch(a){case 1:e<128&&(i=e);break;case 2:n=t[o+1],128==(192&n)&&(l=(31&e)<<6|63&n,l>127&&(i=l));break;case 3:n=t[o+1],r=t[o+2],128==(192&n)&&128==(192&r)&&(l=(15&e)<<12|(63&n)<<6|63&r,l>2047&&(l<55296||l>57343)&&(i=l));break;case 4:n=t[o+1],r=t[o+2],s=t[o+3],128==(192&n)&&128==(192&r)&&128==(192&s)&&(l=(15&e)<<18|(63&n)<<12|(63&r)<<6|63&s,l>65535&&l<1114112&&(i=l))}}null===i?(i=65533,a=1):i>65535&&(i-=65536,r.push(i>>>10&1023|55296),i=56320|1023&i),r.push(i),o+=a}return function(t){const e=t.length;if(e<=P)return String.fromCharCode.apply(String,t);let n="",r=0;for(;r<e;)n+=String.fromCharCode.apply(String,t.slice(r,r+=P));return n}(r)}l.TYPED_ARRAY_SUPPORT=function(){try{const t=new Uint8Array(1),e={foo:function(){return 42}};return Object.setPrototypeOf(e,Uint8Array.prototype),Object.setPrototypeOf(t,e),42===t.foo()}catch(t){return!1}}(),l.TYPED_ARRAY_SUPPORT||"undefined"==typeof console||"function"!=typeof console.error||console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."),Object.defineProperty(l.prototype,"parent",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.buffer}}),Object.defineProperty(l.prototype,"offset",{enumerable:!0,get:function(){if(l.isBuffer(this))return this.byteOffset}}),l.poolSize=8192,l.from=function(t,e,n){return c(t,e,n)},Object.setPrototypeOf(l.prototype,Uint8Array.prototype),Object.setPrototypeOf(l,Uint8Array),l.alloc=function(t,e,n){return function(t,e,n){return u(t),t<=0?s(t):void 0!==e?"string"==typeof n?s(t).fill(e,n):s(t).fill(e):s(t)}(t,e,n)},l.allocUnsafe=function(t){return p(t)},l.allocUnsafeSlow=function(t){return p(t)},l.isBuffer=function(t){return null!=t&&!0===t._isBuffer&&t!==l.prototype},l.compare=function(t,e){if(K(t,Uint8Array)&&(t=l.from(t,t.offset,t.byteLength)),K(e,Uint8Array)&&(e=l.from(e,e.offset,e.byteLength)),!l.isBuffer(t)||!l.isBuffer(e))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(t===e)return 0;let n=t.length,r=e.length;for(let o=0,i=Math.min(n,r);o<i;++o)if(t[o]!==e[o]){n=t[o],r=e[o];break}return n<r?-1:r<n?1:0},l.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},l.concat=function(t,e){if(!Array.isArray(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return l.alloc(0);let n;if(void 0===e)for(e=0,n=0;n<t.length;++n)e+=t[n].length;const r=l.allocUnsafe(e);let o=0;for(n=0;n<t.length;++n){let e=t[n];if(K(e,Uint8Array))o+e.length>r.length?(l.isBuffer(e)||(e=l.from(e)),e.copy(r,o)):Uint8Array.prototype.set.call(r,e,o);else{if(!l.isBuffer(e))throw new TypeError('"list" argument must be an Array of Buffers');e.copy(r,o)}o+=e.length}return r},l.byteLength=m,l.prototype._isBuffer=!0,l.prototype.swap16=function(){const t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(let e=0;e<t;e+=2)y(this,e,e+1);return this},l.prototype.swap32=function(){const t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(let e=0;e<t;e+=4)y(this,e,e+3),y(this,e+1,e+2);return this},l.prototype.swap64=function(){const t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(let e=0;e<t;e+=8)y(this,e,e+7),y(this,e+1,e+6),y(this,e+2,e+5),y(this,e+3,e+4);return this},l.prototype.toString=function(){const t=this.length;return 0===t?"":0===arguments.length?T(this,0,t):g.apply(this,arguments)},l.prototype.toLocaleString=l.prototype.toString,l.prototype.equals=function(t){if(!l.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===l.compare(this,t)},l.prototype.inspect=function(){let t="";const n=e.h2;return t=this.toString("hex",0,n).replace(/(.{2})/g,"$1 ").trim(),this.length>n&&(t+=" ... "),"<Buffer "+t+">"},i&&(l.prototype[i]=l.prototype.inspect),l.prototype.compare=function(t,e,n,r,o){if(K(t,Uint8Array)&&(t=l.from(t,t.offset,t.byteLength)),!l.isBuffer(t))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof t);if(void 0===e&&(e=0),void 0===n&&(n=t?t.length:0),void 0===r&&(r=0),void 0===o&&(o=this.length),e<0||n>t.length||r<0||o>this.length)throw new RangeError("out of range index");if(r>=o&&e>=n)return 0;if(r>=o)return-1;if(e>=n)return 1;if(this===t)return 0;let i=(o>>>=0)-(r>>>=0),a=(n>>>=0)-(e>>>=0);const s=Math.min(i,a),c=this.slice(r,o),u=t.slice(e,n);for(let t=0;t<s;++t)if(c[t]!==u[t]){i=c[t],a=u[t];break}return i<a?-1:a<i?1:0},l.prototype.includes=function(t,e,n){return-1!==this.indexOf(t,e,n)},l.prototype.indexOf=function(t,e,n){return v(this,t,e,n,!0)},l.prototype.lastIndexOf=function(t,e,n){return v(this,t,e,n,!1)},l.prototype.write=function(t,e,n,r){if(void 0===e)r="utf8",n=this.length,e=0;else if(void 0===n&&"string"==typeof e)r=e,n=this.length,e=0;else{if(!isFinite(e))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e>>>=0,isFinite(n)?(n>>>=0,void 0===r&&(r="utf8")):(r=n,n=void 0)}const o=this.length-e;if((void 0===n||n>o)&&(n=o),t.length>0&&(n<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");r||(r="utf8");let i=!1;for(;;)switch(r){case"hex":return C(this,t,e,n);case"utf8":case"utf-8":return E(this,t,e,n);case"ascii":case"latin1":case"binary":return w(this,t,e,n);case"base64":return S(this,t,e,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return b(this,t,e,n);default:if(i)throw new TypeError("Unknown encoding: "+r);r=(""+r).toLowerCase(),i=!0}},l.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};const P=4096;function A(t,e,n){let r="";n=Math.min(t.length,n);for(let o=e;o<n;++o)r+=String.fromCharCode(127&t[o]);return r}function O(t,e,n){let r="";n=Math.min(t.length,n);for(let o=e;o<n;++o)r+=String.fromCharCode(t[o]);return r}function x(t,e,n){const r=t.length;(!e||e<0)&&(e=0),(!n||n<0||n>r)&&(n=r);let o="";for(let r=e;r<n;++r)o+=$[t[r]];return o}function I(t,e,n){const r=t.slice(e,n);let o="";for(let t=0;t<r.length-1;t+=2)o+=String.fromCharCode(r[t]+256*r[t+1]);return o}function R(t,e,n){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>n)throw new RangeError("Trying to access beyond buffer length")}function M(t,e,n,r,o,i){if(!l.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>o||e<i)throw new RangeError('"value" argument is out of bounds');if(n+r>t.length)throw new RangeError("Index out of range")}function Z(t,e,n,r,o){j(e,r,o,t,n,7);let i=Number(e&BigInt(4294967295));t[n++]=i,i>>=8,t[n++]=i,i>>=8,t[n++]=i,i>>=8,t[n++]=i;let a=Number(e>>BigInt(32)&BigInt(4294967295));return t[n++]=a,a>>=8,t[n++]=a,a>>=8,t[n++]=a,a>>=8,t[n++]=a,n}function D(t,e,n,r,o){j(e,r,o,t,n,7);let i=Number(e&BigInt(4294967295));t[n+7]=i,i>>=8,t[n+6]=i,i>>=8,t[n+5]=i,i>>=8,t[n+4]=i;let a=Number(e>>BigInt(32)&BigInt(4294967295));return t[n+3]=a,a>>=8,t[n+2]=a,a>>=8,t[n+1]=a,a>>=8,t[n]=a,n+8}function N(t,e,n,r,o,i){if(n+r>t.length)throw new RangeError("Index out of range");if(n<0)throw new RangeError("Index out of range")}function k(t,e,n,r,i){return e=+e,n>>>=0,i||N(t,0,n,4),o.write(t,e,n,r,23,4),n+4}function F(t,e,n,r,i){return e=+e,n>>>=0,i||N(t,0,n,8),o.write(t,e,n,r,52,8),n+8}l.prototype.slice=function(t,e){const n=this.length;(t=~~t)<0?(t+=n)<0&&(t=0):t>n&&(t=n),(e=void 0===e?n:~~e)<0?(e+=n)<0&&(e=0):e>n&&(e=n),e<t&&(e=t);const r=this.subarray(t,e);return Object.setPrototypeOf(r,l.prototype),r},l.prototype.readUintLE=l.prototype.readUIntLE=function(t,e,n){t>>>=0,e>>>=0,n||R(t,e,this.length);let r=this[t],o=1,i=0;for(;++i<e&&(o*=256);)r+=this[t+i]*o;return r},l.prototype.readUintBE=l.prototype.readUIntBE=function(t,e,n){t>>>=0,e>>>=0,n||R(t,e,this.length);let r=this[t+--e],o=1;for(;e>0&&(o*=256);)r+=this[t+--e]*o;return r},l.prototype.readUint8=l.prototype.readUInt8=function(t,e){return t>>>=0,e||R(t,1,this.length),this[t]},l.prototype.readUint16LE=l.prototype.readUInt16LE=function(t,e){return t>>>=0,e||R(t,2,this.length),this[t]|this[t+1]<<8},l.prototype.readUint16BE=l.prototype.readUInt16BE=function(t,e){return t>>>=0,e||R(t,2,this.length),this[t]<<8|this[t+1]},l.prototype.readUint32LE=l.prototype.readUInt32LE=function(t,e){return t>>>=0,e||R(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},l.prototype.readUint32BE=l.prototype.readUInt32BE=function(t,e){return t>>>=0,e||R(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},l.prototype.readBigUInt64LE=J((function(t){W(t>>>=0,"offset");const e=this[t],n=this[t+7];void 0!==e&&void 0!==n||q(t,this.length-8);const r=e+256*this[++t]+65536*this[++t]+this[++t]*2**24,o=this[++t]+256*this[++t]+65536*this[++t]+n*2**24;return BigInt(r)+(BigInt(o)<<BigInt(32))})),l.prototype.readBigUInt64BE=J((function(t){W(t>>>=0,"offset");const e=this[t],n=this[t+7];void 0!==e&&void 0!==n||q(t,this.length-8);const r=e*2**24+65536*this[++t]+256*this[++t]+this[++t],o=this[++t]*2**24+65536*this[++t]+256*this[++t]+n;return(BigInt(r)<<BigInt(32))+BigInt(o)})),l.prototype.readIntLE=function(t,e,n){t>>>=0,e>>>=0,n||R(t,e,this.length);let r=this[t],o=1,i=0;for(;++i<e&&(o*=256);)r+=this[t+i]*o;return o*=128,r>=o&&(r-=Math.pow(2,8*e)),r},l.prototype.readIntBE=function(t,e,n){t>>>=0,e>>>=0,n||R(t,e,this.length);let r=e,o=1,i=this[t+--r];for(;r>0&&(o*=256);)i+=this[t+--r]*o;return o*=128,i>=o&&(i-=Math.pow(2,8*e)),i},l.prototype.readInt8=function(t,e){return t>>>=0,e||R(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},l.prototype.readInt16LE=function(t,e){t>>>=0,e||R(t,2,this.length);const n=this[t]|this[t+1]<<8;return 32768&n?4294901760|n:n},l.prototype.readInt16BE=function(t,e){t>>>=0,e||R(t,2,this.length);const n=this[t+1]|this[t]<<8;return 32768&n?4294901760|n:n},l.prototype.readInt32LE=function(t,e){return t>>>=0,e||R(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},l.prototype.readInt32BE=function(t,e){return t>>>=0,e||R(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},l.prototype.readBigInt64LE=J((function(t){W(t>>>=0,"offset");const e=this[t],n=this[t+7];void 0!==e&&void 0!==n||q(t,this.length-8);const r=this[t+4]+256*this[t+5]+65536*this[t+6]+(n<<24);return(BigInt(r)<<BigInt(32))+BigInt(e+256*this[++t]+65536*this[++t]+this[++t]*2**24)})),l.prototype.readBigInt64BE=J((function(t){W(t>>>=0,"offset");const e=this[t],n=this[t+7];void 0!==e&&void 0!==n||q(t,this.length-8);const r=(e<<24)+65536*this[++t]+256*this[++t]+this[++t];return(BigInt(r)<<BigInt(32))+BigInt(this[++t]*2**24+65536*this[++t]+256*this[++t]+n)})),l.prototype.readFloatLE=function(t,e){return t>>>=0,e||R(t,4,this.length),o.read(this,t,!0,23,4)},l.prototype.readFloatBE=function(t,e){return t>>>=0,e||R(t,4,this.length),o.read(this,t,!1,23,4)},l.prototype.readDoubleLE=function(t,e){return t>>>=0,e||R(t,8,this.length),o.read(this,t,!0,52,8)},l.prototype.readDoubleBE=function(t,e){return t>>>=0,e||R(t,8,this.length),o.read(this,t,!1,52,8)},l.prototype.writeUintLE=l.prototype.writeUIntLE=function(t,e,n,r){if(t=+t,e>>>=0,n>>>=0,!r){M(this,t,e,n,Math.pow(2,8*n)-1,0)}let o=1,i=0;for(this[e]=255&t;++i<n&&(o*=256);)this[e+i]=t/o&255;return e+n},l.prototype.writeUintBE=l.prototype.writeUIntBE=function(t,e,n,r){if(t=+t,e>>>=0,n>>>=0,!r){M(this,t,e,n,Math.pow(2,8*n)-1,0)}let o=n-1,i=1;for(this[e+o]=255&t;--o>=0&&(i*=256);)this[e+o]=t/i&255;return e+n},l.prototype.writeUint8=l.prototype.writeUInt8=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,1,255,0),this[e]=255&t,e+1},l.prototype.writeUint16LE=l.prototype.writeUInt16LE=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,2,65535,0),this[e]=255&t,this[e+1]=t>>>8,e+2},l.prototype.writeUint16BE=l.prototype.writeUInt16BE=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,2,65535,0),this[e]=t>>>8,this[e+1]=255&t,e+2},l.prototype.writeUint32LE=l.prototype.writeUInt32LE=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,4,4294967295,0),this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=255&t,e+4},l.prototype.writeUint32BE=l.prototype.writeUInt32BE=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,4,4294967295,0),this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t,e+4},l.prototype.writeBigUInt64LE=J((function(t,e=0){return Z(this,t,e,BigInt(0),BigInt("0xffffffffffffffff"))})),l.prototype.writeBigUInt64BE=J((function(t,e=0){return D(this,t,e,BigInt(0),BigInt("0xffffffffffffffff"))})),l.prototype.writeIntLE=function(t,e,n,r){if(t=+t,e>>>=0,!r){const r=Math.pow(2,8*n-1);M(this,t,e,n,r-1,-r)}let o=0,i=1,a=0;for(this[e]=255&t;++o<n&&(i*=256);)t<0&&0===a&&0!==this[e+o-1]&&(a=1),this[e+o]=(t/i>>0)-a&255;return e+n},l.prototype.writeIntBE=function(t,e,n,r){if(t=+t,e>>>=0,!r){const r=Math.pow(2,8*n-1);M(this,t,e,n,r-1,-r)}let o=n-1,i=1,a=0;for(this[e+o]=255&t;--o>=0&&(i*=256);)t<0&&0===a&&0!==this[e+o+1]&&(a=1),this[e+o]=(t/i>>0)-a&255;return e+n},l.prototype.writeInt8=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,1,127,-128),t<0&&(t=255+t+1),this[e]=255&t,e+1},l.prototype.writeInt16LE=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,2,32767,-32768),this[e]=255&t,this[e+1]=t>>>8,e+2},l.prototype.writeInt16BE=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,2,32767,-32768),this[e]=t>>>8,this[e+1]=255&t,e+2},l.prototype.writeInt32LE=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,4,2147483647,-2147483648),this[e]=255&t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24,e+4},l.prototype.writeInt32BE=function(t,e,n){return t=+t,e>>>=0,n||M(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t,e+4},l.prototype.writeBigInt64LE=J((function(t,e=0){return Z(this,t,e,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))})),l.prototype.writeBigInt64BE=J((function(t,e=0){return D(this,t,e,-BigInt("0x8000000000000000"),BigInt("0x7fffffffffffffff"))})),l.prototype.writeFloatLE=function(t,e,n){return k(this,t,e,!0,n)},l.prototype.writeFloatBE=function(t,e,n){return k(this,t,e,!1,n)},l.prototype.writeDoubleLE=function(t,e,n){return F(this,t,e,!0,n)},l.prototype.writeDoubleBE=function(t,e,n){return F(this,t,e,!1,n)},l.prototype.copy=function(t,e,n,r){if(!l.isBuffer(t))throw new TypeError("argument should be a Buffer");if(n||(n=0),r||0===r||(r=this.length),e>=t.length&&(e=t.length),e||(e=0),r>0&&r<n&&(r=n),r===n)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(n<0||n>=this.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("sourceEnd out of bounds");r>this.length&&(r=this.length),t.length-e<r-n&&(r=t.length-e+n);const o=r-n;return this===t&&"function"==typeof Uint8Array.prototype.copyWithin?this.copyWithin(e,n,r):Uint8Array.prototype.set.call(t,this.subarray(n,r),e),o},l.prototype.fill=function(t,e,n,r){if("string"==typeof t){if("string"==typeof e?(r=e,e=0,n=this.length):"string"==typeof n&&(r=n,n=this.length),void 0!==r&&"string"!=typeof r)throw new TypeError("encoding must be a string");if("string"==typeof r&&!l.isEncoding(r))throw new TypeError("Unknown encoding: "+r);if(1===t.length){const e=t.charCodeAt(0);("utf8"===r&&e<128||"latin1"===r)&&(t=e)}}else"number"==typeof t?t&=255:"boolean"==typeof t&&(t=Number(t));if(e<0||this.length<e||this.length<n)throw new RangeError("Out of range index");if(n<=e)return this;let o;if(e>>>=0,n=void 0===n?this.length:n>>>0,t||(t=0),"number"==typeof t)for(o=e;o<n;++o)this[o]=t;else{const i=l.isBuffer(t)?t:l.from(t,r),a=i.length;if(0===a)throw new TypeError('The value "'+t+'" is invalid for argument "value"');for(o=0;o<n-e;++o)this[o+e]=i[o%a]}return this};const U={};function G(t,e,n){U[t]=class extends n{constructor(){super(),Object.defineProperty(this,"message",{value:e.apply(this,arguments),writable:!0,configurable:!0}),this.name=`${this.name} [${t}]`,this.stack,delete this.name}get code(){return t}set code(t){Object.defineProperty(this,"code",{configurable:!0,enumerable:!0,value:t,writable:!0})}toString(){return`${this.name} [${t}]: ${this.message}`}}}function B(t){let e="",n=t.length;const r="-"===t[0]?1:0;for(;n>=r+4;n-=3)e=`_${t.slice(n-3,n)}${e}`;return`${t.slice(0,n)}${e}`}function j(t,e,n,r,o,i){if(t>n||t<e){const r="bigint"==typeof e?"n":"";let o;throw o=i>3?0===e||e===BigInt(0)?`>= 0${r} and < 2${r} ** ${8*(i+1)}${r}`:`>= -(2${r} ** ${8*(i+1)-1}${r}) and < 2 ** ${8*(i+1)-1}${r}`:`>= ${e}${r} and <= ${n}${r}`,new U.ERR_OUT_OF_RANGE("value",o,t)}!function(t,e,n){W(e,"offset"),void 0!==t[e]&&void 0!==t[e+n]||q(e,t.length-(n+1))}(r,o,i)}function W(t,e){if("number"!=typeof t)throw new U.ERR_INVALID_ARG_TYPE(e,"number",t)}function q(t,e,n){if(Math.floor(t)!==t)throw W(t,n),new U.ERR_OUT_OF_RANGE(n||"offset","an integer",t);if(e<0)throw new U.ERR_BUFFER_OUT_OF_BOUNDS;throw new U.ERR_OUT_OF_RANGE(n||"offset",`>= ${n?1:0} and <= ${e}`,t)}G("ERR_BUFFER_OUT_OF_BOUNDS",(function(t){return t?`${t} is outside of buffer bounds`:"Attempt to access memory outside buffer bounds"}),RangeError),G("ERR_INVALID_ARG_TYPE",(function(t,e){return`The "${t}" argument must be of type number. Received type ${typeof e}`}),TypeError),G("ERR_OUT_OF_RANGE",(function(t,e,n){let r=`The value of "${t}" is out of range.`,o=n;return Number.isInteger(n)&&Math.abs(n)>2**32?o=B(String(n)):"bigint"==typeof n&&(o=String(n),(n>BigInt(2)**BigInt(32)||n<-(BigInt(2)**BigInt(32)))&&(o=B(o)),o+="n"),r+=` It must be ${e}. Received ${o}`,r}),RangeError);const H=/[^+/0-9A-Za-z-_]/g;function V(t,e){let n;e=e||1/0;const r=t.length;let o=null;const i=[];for(let a=0;a<r;++a){if(n=t.charCodeAt(a),n>55295&&n<57344){if(!o){if(n>56319){(e-=3)>-1&&i.push(239,191,189);continue}if(a+1===r){(e-=3)>-1&&i.push(239,191,189);continue}o=n;continue}if(n<56320){(e-=3)>-1&&i.push(239,191,189),o=n;continue}n=65536+(o-55296<<10|n-56320)}else o&&(e-=3)>-1&&i.push(239,191,189);if(o=null,n<128){if((e-=1)<0)break;i.push(n)}else if(n<2048){if((e-=2)<0)break;i.push(n>>6|192,63&n|128)}else if(n<65536){if((e-=3)<0)break;i.push(n>>12|224,n>>6&63|128,63&n|128)}else{if(!(n<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;i.push(n>>18|240,n>>12&63|128,n>>6&63|128,63&n|128)}}return i}function z(t){return r.toByteArray(function(t){if((t=(t=t.split("=")[0]).trim().replace(H,"")).length<2)return"";for(;t.length%4!=0;)t+="=";return t}(t))}function Y(t,e,n,r){let o;for(o=0;o<r&&!(o+n>=e.length||o>=t.length);++o)e[o+n]=t[o];return o}function K(t,e){return t instanceof e||null!=t&&null!=t.constructor&&null!=t.constructor.name&&t.constructor.name===e.name}function X(t){return t!=t}const $=function(){const t="0123456789abcdef",e=new Array(256);for(let n=0;n<16;++n){const r=16*n;for(let o=0;o<16;++o)e[r+o]=t[n]+t[o]}return e}();function J(t){return"undefined"==typeof BigInt?Q:t}function Q(){throw new Error("BigInt not supported")}},3320:(t,e)=>{
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
e.read=function(t,e,n,r,o){var i,a,s=8*o-r-1,l=(1<<s)-1,c=l>>1,u=-7,p=n?o-1:0,d=n?-1:1,h=t[e+p];for(p+=d,i=h&(1<<-u)-1,h>>=-u,u+=s;u>0;i=256*i+t[e+p],p+=d,u-=8);for(a=i&(1<<-u)-1,i>>=-u,u+=r;u>0;a=256*a+t[e+p],p+=d,u-=8);if(0===i)i=1-c;else{if(i===l)return a?NaN:1/0*(h?-1:1);a+=Math.pow(2,r),i-=c}return(h?-1:1)*a*Math.pow(2,i-r)},e.write=function(t,e,n,r,o,i){var a,s,l,c=8*i-o-1,u=(1<<c)-1,p=u>>1,d=23===o?Math.pow(2,-24)-Math.pow(2,-77):0,h=r?0:i-1,f=r?1:-1,m=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(s=isNaN(e)?1:0,a=u):(a=Math.floor(Math.log(e)/Math.LN2),e*(l=Math.pow(2,-a))<1&&(a--,l*=2),(e+=a+p>=1?d/l:d*Math.pow(2,1-p))*l>=2&&(a++,l/=2),a+p>=u?(s=0,a=u):a+p>=1?(s=(e*l-1)*Math.pow(2,o),a+=p):(s=e*Math.pow(2,p-1)*Math.pow(2,o),a=0));o>=8;t[n+h]=255&s,h+=f,s/=256,o-=8);for(a=a<<o|s,c+=o;c>0;t[n+h]=255&a,h+=f,a/=256,c-=8);t[n+h-f]|=128*m}},9211:function(t,e){var n,r=this&&this.__extends||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);function r(){this.constructor=t}t.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r)};function n(t){if(!t)return n.__;Array.prototype.reduce||(Array.prototype.reduce=function(t,e){for(var n=e,r=0;r<this.length;r++)n=t(n,this[r],r,this);return n});var e="";return("."+t).split(".").reduce((function(t,r,o,i){e?e+="."+r:e=r;var a=t["__"+e];return void 0===a&&(n.Logger.prototype=t,a=new n.Logger(e),t["__"+e]=a),a}),n.__)}!function(t){function e(t,e,n){void 0!==e[t]&&(null!==e[t]?n[t]=e[t]:delete n[t])}function n(e){if(null!=t.enabled&&!t.enabled)return!1;if(null!=t.maxMessages&&t.maxMessages<1)return!1;try{if(e.userAgentRegex&&!new RegExp(e.userAgentRegex).test(navigator.userAgent))return!1}catch(t){}try{if(e.ipRegex&&t.clientIP&&!new RegExp(e.ipRegex).test(t.clientIP))return!1}catch(t){}return!0}function o(t,e){try{if(t.disallow&&new RegExp(t.disallow).test(e))return!1}catch(t){}return!0}function i(t){return"function"==typeof t?t instanceof RegExp?t.toString():t():t}t.requestId="";var a=function(t,e,n){this.msg=t,this.meta=e,this.finalString=n};function s(t){var e,n=i(t);switch(typeof n){case"string":return new a(n,null,n);case"number":case"boolean":return e=n.toString(),new a(e,null,e);case"undefined":return new a("undefined",null,"undefined");case"object":return n instanceof RegExp||n instanceof String||n instanceof Number||n instanceof Boolean?(e=n.toString(),new a(e,null,e)):new a(null,n,JSON.stringify(n));default:return new a("unknown",null,"unknown")}}function l(){return 1e3}function c(){return 2e3}function u(){return 3e3}function p(){return 4e3}function d(){return 5e3}function h(){return 6e3}function f(t){return t<=1e3?"trace":t<=2e3?"debug":t<=3e3?"info":t<=4e3?"warn":t<=5e3?"error":"fatal"}t.setOptions=function(t){return e("enabled",t,this),e("maxMessages",t,this),e("defaultAjaxUrl",t,this),e("clientIP",t,this),e("requestId",t,this),e("defaultBeforeSend",t,this),this},t.getAllLevel=function(){return-2147483648},t.getTraceLevel=l,t.getDebugLevel=c,t.getInfoLevel=u,t.getWarnLevel=p,t.getErrorLevel=d,t.getFatalLevel=h,t.getOffLevel=function(){return 2147483647};var m=function(t,e){this.inner=e,this.name="JL.Exception",this.message=s(t).finalString};t.Exception=m,m.prototype=new Error;var g=function(t,e,n,r){this.l=t,this.m=e,this.n=n,this.t=r};t.LogItem=g;var y=function(){function r(e,n){this.appenderName=e,this.sendLogItems=n,this.level=t.getTraceLevel(),this.sendWithBufferLevel=2147483647,this.storeInBufferLevel=-2147483648,this.bufferSize=0,this.batchSize=1,this.buffer=[],this.batchBuffer=[]}return r.prototype.setOptions=function(t){return e("level",t,this),e("ipRegex",t,this),e("userAgentRegex",t,this),e("disallow",t,this),e("sendWithBufferLevel",t,this),e("storeInBufferLevel",t,this),e("bufferSize",t,this),e("batchSize",t,this),this.bufferSize<this.buffer.length&&(this.buffer.length=this.bufferSize),this},r.prototype.log=function(t,e,r,i,a,s,l){var c;n(this)&&o(this,s)&&(a<this.storeInBufferLevel||(c=new g(a,s,l,(new Date).getTime()),a<this.level?this.bufferSize>0&&(this.buffer.push(c),this.buffer.length>this.bufferSize&&this.buffer.shift()):(a<this.sendWithBufferLevel||this.buffer.length&&(this.batchBuffer=this.batchBuffer.concat(this.buffer),this.buffer.length=0),this.batchBuffer.push(c),this.batchBuffer.length>=this.batchSize&&this.sendBatch())))},r.prototype.sendBatch=function(){0!=this.batchBuffer.length&&(null!=t.maxMessages&&t.maxMessages<1||(null!=t.maxMessages&&(t.maxMessages-=this.batchBuffer.length),this.sendLogItems(this.batchBuffer),this.batchBuffer.length=0))},r}();t.Appender=y;var v=function(n){function o(t){n.call(this,t,o.prototype.sendLogItemsAjax)}return r(o,n),o.prototype.setOptions=function(t){return e("url",t,this),e("beforeSend",t,this),n.prototype.setOptions.call(this,t),this},o.prototype.sendLogItemsAjax=function(e){try{var n="/jsnlog.logger";null!=t.defaultAjaxUrl&&(n=t.defaultAjaxUrl),this.url&&(n=this.url);var r=this.getXhr(n),o={r:t.requestId,lg:e};"function"==typeof this.beforeSend?this.beforeSend.call(this,r,o):"function"==typeof t.defaultBeforeSend&&t.defaultBeforeSend.call(this,r,o);var i=JSON.stringify(o);r.send(i)}catch(t){}},o.prototype.getXhr=function(e){var n=new XMLHttpRequest;if(!("withCredentials"in n)&&"undefined"!=typeof XDomainRequest){var r=new XDomainRequest;return r.open("POST",e),r}return n.open("POST",e),n.setRequestHeader("Content-Type","application/json"),n.setRequestHeader("JSNLog-RequestId",t.requestId),n},o}(y);t.AjaxAppender=v;var _=function(e){function n(t){e.call(this,t,n.prototype.sendLogItemsConsole)}return r(n,e),n.prototype.clog=function(t){console.log(t)},n.prototype.cerror=function(t){console.error?console.error(t):this.clog(t)},n.prototype.cwarn=function(t){console.warn?console.warn(t):this.clog(t)},n.prototype.cinfo=function(t){console.info?console.info(t):this.clog(t)},n.prototype.cdebug=function(t){console.debug?console.debug(t):this.cinfo(t)},n.prototype.sendLogItemsConsole=function(e){try{if(!console)return;var n;for(n=0;n<e.length;++n){var r=e[n],o=r.n+": "+r.m;"undefined"==typeof window&&(o=new Date(r.t)+" | "+o),r.l<=t.getDebugLevel()?this.cdebug(o):r.l<=t.getInfoLevel()?this.cinfo(o):r.l<=t.getWarnLevel()?this.cwarn(o):this.cerror(o)}}catch(t){}},n}(y);t.ConsoleAppender=_;var C=function(){function t(t){this.loggerName=t,this.seenRegexes=[]}return t.prototype.setOptions=function(t){return e("level",t,this),e("userAgentRegex",t,this),e("disallow",t,this),e("ipRegex",t,this),e("appenders",t,this),e("onceOnly",t,this),this.seenRegexes=[],this},t.prototype.buildExceptionObject=function(t){var e={};return t.stack?e.stack=t.stack:e.e=t,t.message&&(e.message=t.message),t.name&&(e.name=t.name),t.data&&(e.data=t.data),t.inner&&(e.inner=this.buildExceptionObject(t.inner)),e},t.prototype.log=function(t,e,r){var a,l,c=0;if(!this.appenders)return this;if(t>=this.level&&n(this)&&(r?(l=this.buildExceptionObject(r)).logData=i(e):l=e,o(this,(a=s(l)).finalString))){if(this.onceOnly)for(c=this.onceOnly.length-1;c>=0;){if(new RegExp(this.onceOnly[c]).test(a.finalString)){if(this.seenRegexes[c])return this;this.seenRegexes[c]=!0}c--}for(a.meta=a.meta||{},a.meta.loggerName=this.loggerName,c=this.appenders.length-1;c>=0;)this.appenders[c].log(f(t),a.msg,a.meta,(function(){}),t,a.finalString,this.loggerName),c--}return this},t.prototype.trace=function(t){return this.log(1e3,t)},t.prototype.debug=function(t){return this.log(2e3,t)},t.prototype.info=function(t){return this.log(3e3,t)},t.prototype.warn=function(t){return this.log(4e3,t)},t.prototype.error=function(t){return this.log(5e3,t)},t.prototype.fatal=function(t){return this.log(6e3,t)},t.prototype.fatalException=function(t,e){return this.log(6e3,t,e)},t}();t.Logger=C,t.createAjaxAppender=function(t){return new v(t)},t.createConsoleAppender=function(t){return new _(t)};var E=new v("");"undefined"==typeof window&&(E=new _("")),t.__=new t.Logger(""),t.__.setOptions({level:t.getDebugLevel(),appenders:[E]})}(n||(n={})),e.JL=n,"function"==typeof __jsnlog_configure&&__jsnlog_configure(n)},4944:(t,e,n)=>{var r=n(5769).lW;
/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
/**
 * @overview API SITNA: API JavaScript para la visualización de datos georreferenciados en aplicaciones web.
 * @version 3.0.1
 * @copyright 2019 Gobierno de Navarra
 * @license BSD-2-Clause
 * @author Fernando Lacunza <flacunza@itracasa.es>
 */
t.Z.isDebug=!1,t.Z.Util=e.Z,t.Z.Consts=n.Z,t.Z.i18n=r.Z,t.Z.Cfg=o.v,t.Z.Map=i.Z,t.Z.wrap=f.Z,t.Z.tool={Proxification:h.Z},globalThis.TC=t.Z;var g=g||{};g.feature=g.feature||{},g.feature.Marker=d,t.Z.version="3.0.1 [10/10/2023, 9:59:28]",t.Z.loadCSS(t.Z.apiLocation+"TC/css/tcmap.css"),t.Z.loadProjDef({crs:"EPSG:25830",name:"ETRS89 / UTM zone 30N",def:"+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs"}),t.Z.loadProjDef({crs:"EPSG:4258",name:"ETRS89",def:"+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs +axis=neu"}),t.Z.loadProjDef({crs:"EPSG:3040",name:"ETRS89 / UTM zone 28N (N-E)",def:"+proj=utm +zone=28 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu"}),t.Z.loadProjDef({crs:"EPSG:3041",name:"ETRS89 / UTM zone 29N (N-E)",def:"+proj=utm +zone=29 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu"}),t.Z.loadProjDef({crs:"EPSG:3042",name:"ETRS89 / UTM zone 30N (N-E)",def:"+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu"}),t.Z.loadProjDef({crs:"EPSG:3043",name:"ETRS89 / UTM zone 31N (N-E)",def:"+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu"}),t.Z.loadProjDef({crs:"EPSG:4230",name:"ED50",def:"+proj=longlat +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +no_defs +axis=neu"}),t.Z.loadProjDef({crs:"EPSG:25828",name:"ETRS89 / UTM zone 28N",def:"+proj=utm +zone=28 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"}),t.Z.loadProjDef({crs:"EPSG:25829",name:"ETRS89 / UTM zone 29N",def:"+proj=utm +zone=29 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"}),t.Z.loadProjDef({crs:"EPSG:25831",name:"ETRS89 / UTM zone 31N",def:"+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"}),t.Z.loadJS(!t.Z.browserFeatures.urlParser(),t.Z.apiLocation+t.Z.Consts.url.URL_POLYFILL,(function(){})),document.addEventListener("DOMContentLoaded",(function(){var e,n,r="Unknown library";if(window.ol&&(r="OpenLayers "+ol.VERSION),t.Z.version=t.Z.version+" ("+r+"; @ "+t.Z.apiLocation+")",t.Z.browser=t.Z.Util.getBrowser(),t.Z.loadJS(!t.Z.Cfg.acceptedBrowserVersions,t.Z.apiLocation+"TC/config/browser-versions.js",(function(e){t.Z._isSupported=!0;var n=t.Z.Cfg.acceptedBrowserVersions.filter((function(e){return e.name.toLowerCase()===t.Z.browser.name.toLowerCase()}));if(n.length>0&&n[0].expired)t.Z.Cfg.loggingErrorsEnabled=!1;else if(n.length>0&&!isNaN(n[0].version)&&t.Z.browser.version<n[0].version&&(t.Z._isSupported=!1),t.Z.Cfg.oldBrowserAlert&&!t.Z._isSupported){t.Z.Cfg.loggingErrorsEnabled=!1;const e=t.Z.Map.get(document.querySelector("."+t.Z.Consts.classes.MAP));t.Z.i18n.loadResources(!t.Z.i18n[e.options.locale],t.Z.apiLocation+"TC/resources/",e.options.locale).then((function(){t.Z.error(t.Z.Util.getLocaleString(e.options.locale,"outdatedBrowser"),t.Z.Consts.msgErrorMode.TOAST)}))}})),/ip(ad|hone|od)/i.test(navigator.userAgent)&&(t.Z.Consts.event.CLICK="touchstart"),t.Z.Cfg.loggingErrorsEnabled){m.JL.setOptions({defaultAjaxUrl:t.Z.Consts.url.ERROR_LOGGER.includes("//localhost")?"":t.Z.Consts.url.ERROR_LOGGER});const r=(n=0,function(r){if(!(e=e||t.Z.Map.get(document.querySelector("."+t.Z.Consts.classes.MAP))))return!1;var o,i,a,s="",l=-1,c=-1;if("unhandledrejection"===r.type?(o=r.reason?r.reason instanceof XMLDocument?r.reason.firstElementChild.outerHTML:r.reason.message:"",a=!r.reason||!r.reason.stack||r.reason.stack.indexOf(t.Z.apiLocation)>=0,i=r.reason):(o=r.message,s=r.filename,l=r.lineno,c=r.colno,i=r.error,a=s.indexOf(t.Z.apiLocation)>=0),(t.Z.Cfg.notifyApplicationErrors||a)&&n<t.Z.Cfg.maxErrorCount&&t.Z.Cfg.loggingErrorsEnabled){const r=e.getPreviousMapState(),p=function(e){var u=a?t.Z.Consts.text.API_ERROR:t.Z.Consts.text.APP_ERROR;(0,m.JL)("onerrorLogger").fatalException({msg:u,errorMsg:o,url:s,lineNumber:l,column:c,appUrl:e,apiVersion:t.Z.version,prevState:r,userAgent:navigator.userAgent},i),n++};let d=location.href;const h=e.exportControlStates()||[];if(h.length>0){var u=location.href;const t=u.indexOf("#");t>0&&(u=u.substring(0,t)),e.getMapState({extraStates:{ctl:h}}).then((t=>{d=u.concat("#",t),p(d)}))}else p(d);t.Z.isDebug||t.Z.i18n.loadResources(!t.Z.i18n[e.options.locale],t.Z.apiLocation+"TC/resources/",e.options.locale).then((function(){t.Z.error(t.Z.Util.getLocaleString(e.options.locale,"genericError")+(e.options.contactEmail||"webmaster@itracasa.es"),{type:t.Z.Consts.msgType.ERROR})}))}return!1});window.addEventListener("error",r,!1),window.addEventListener("unhandledrejection",r,!1)}})),g.Map=c,o.v.layout=t.Z.apiLocation+"TC/layout/responsive";const y=g.feature})(),SITNA=__webpack_exports__})();
//# sourceMappingURL=maps/sitna.js.map
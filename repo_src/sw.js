/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-cc1d1889'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "screenshot-mobile.png",
    "revision": "49ea3d9f2cfd3cf7a9a3a426f3d5aef5"
  }, {
    "url": "screenshot-desktop.png",
    "revision": "26c1ac95d5cfb542fb05d1b8b168a14f"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "d90ebae9c7758f8deb5d76616b5ebbc5"
  }, {
    "url": "pwa-maskable-192x192.png",
    "revision": "89dc81d93fec38a18755a6ced1f65998"
  }, {
    "url": "pwa-512x512.png",
    "revision": "d90ebae9c7758f8deb5d76616b5ebbc5"
  }, {
    "url": "pwa-192x192.png",
    "revision": "1d11e008a7005d564f37108a2f755630"
  }, {
    "url": "paho-mqtt-min.js",
    "revision": "99714171e28ee8d32081cd38ea90fcf3"
  }, {
    "url": "overlay.html",
    "revision": "f9fb2049e25660846b372f614c9617cb"
  }, {
    "url": "index.html",
    "revision": "0b268e75bd44c5ae10c09cadaec64d3c"
  }, {
    "url": "icon.svg",
    "revision": "5e53746a83c1d6a2ee3437d0136e031b"
  }, {
    "url": "favicon.ico",
    "revision": "7f26ebb5ca5bf0456b7892a776fd24d7"
  }, {
    "url": "controller.html",
    "revision": "eeaa7e750a4ae033f726100c76e1f371"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "9b30c428ae00116d994bb922bc61a23d"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/index-DqR1gBeU.css",
    "revision": null
  }, {
    "url": "assets/index-BrnPh6DN.js",
    "revision": null
  }, {
    "url": "assets/aistudio/zim_flag_transparent.png",
    "revision": null
  }, {
    "url": "assets/aistudio/file_00000000d4c081f49b5c2da4254ff257_8ea90194.png",
    "revision": null
  }, {
    "url": "assets/aistudio/ZIM_FLAG_71fcb92e.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_20261022_131821_Facebook_7a2a8c64.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "9b30c428ae00116d994bb922bc61a23d"
  }, {
    "url": "favicon.ico",
    "revision": "7f26ebb5ca5bf0456b7892a776fd24d7"
  }, {
    "url": "icon.svg",
    "revision": "5e53746a83c1d6a2ee3437d0136e031b"
  }, {
    "url": "manifest.json",
    "revision": "dff0e511ea02faa48e6ba5779057644e"
  }, {
    "url": "pwa-192x192.png",
    "revision": "1d11e008a7005d564f37108a2f755630"
  }, {
    "url": "pwa-512x512.png",
    "revision": "d90ebae9c7758f8deb5d76616b5ebbc5"
  }, {
    "url": "pwa-maskable-192x192.png",
    "revision": "89dc81d93fec38a18755a6ced1f65998"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "d90ebae9c7758f8deb5d76616b5ebbc5"
  }, {
    "url": "screenshot-desktop.png",
    "revision": "26c1ac95d5cfb542fb05d1b8b168a14f"
  }, {
    "url": "screenshot-mobile.png",
    "revision": "49ea3d9f2cfd3cf7a9a3a426f3d5aef5"
  }, {
    "url": "manifest.webmanifest",
    "revision": "2f02dd057f1bdeaf0e2e07cb94c41765"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\/.*/, /^\/overlay\.html/]
  }));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/\/api\/sync\/.*/i, new workbox.NetworkOnly(), 'GET');

}));

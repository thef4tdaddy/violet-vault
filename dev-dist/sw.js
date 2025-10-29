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
define(['./workbox-471b75d6'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "3ca0b8505b4bec776b69afdba2768812"
  }, {
    "url": "/offline",
    "revision": "0.v89li5o3tmg"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/offline"), {
    allowlist: [/^\/$/],
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
  }));
  workbox.registerRoute(/^https:\/\/[^\/]+\/app\/(dashboard|budget|envelopes|transactions|bills|analytics)(?:\/.*)?$/, new workbox.CacheFirst({
    "cacheName": "critical-routes-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 30,
      maxAgeSeconds: 1209600
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/[^\/]+\/app/, new workbox.CacheFirst({
    "cacheName": "app-shell-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 25,
      maxAgeSeconds: 604800
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/.*\.googleapis\.com\/.*\/(envelopes|transactions|bills|budget)/, new workbox.NetworkFirst({
    "cacheName": "budget-data-cache",
    "networkTimeoutSeconds": 2,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 200,
      maxAgeSeconds: 21600
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    }), {
      cacheKeyWillBeUsed: async ({
        request
      }) => {
        const url = new URL(request.url);
        url.searchParams.delete("auth");
        return url.href;
      }
    }]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/.*\.googleapis\.com\//, new workbox.NetworkFirst({
    "cacheName": "firebase-api-cache",
    "networkTimeoutSeconds": 3,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 150,
      maxAgeSeconds: 7200
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    }), {
      cacheKeyWillBeUsed: async ({
        request
      }) => {
        const url = new URL(request.url);
        url.searchParams.delete("auth");
        return url.href;
      }
    }]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/securetoken\.googleapis\.com\//, new workbox.NetworkFirst({
    "cacheName": "firebase-auth-cache",
    "networkTimeoutSeconds": 2,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 900
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/, new workbox.CacheFirst({
    "cacheName": "images-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:js|css|woff2?|ttf|eot)$/, new workbox.StaleWhileRevalidate({
    "cacheName": "static-resources",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 1209600
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, new workbox.CacheFirst({
    "cacheName": "google-fonts",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 5184000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/cdn\./, new workbox.StaleWhileRevalidate({
    "cacheName": "cdn-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 604800
    })]
  }), 'GET');
  workbox.registerRoute(/\/(CHANGELOG\.md|patch-notes\.json|manifest\.json)$/, new workbox.NetworkFirst({
    "cacheName": "docs-cache",
    "networkTimeoutSeconds": 5,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 86400
    })]
  }), 'GET');

}));
//# sourceMappingURL=sw.js.map

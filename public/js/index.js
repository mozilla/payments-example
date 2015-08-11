(function() {

  /*global $, FxaRelierClient*/

  // The client ID/secret is set up here:
  // https://oauth-stable.dev.lcip.org/console/client/487e639f210d112d
  // TODO: update this client per
  // https://mail.mozilla.org/pipermail/dev-fxacct/2015-April/001431.html
  // It requires the site to be running from http://pay.dev

  // WARNING: this is just an example app. In a real app you wouldn't
  // expose your client secret to client side code.

  var payURL = 'http://pay.dev:8000/';
  if (window.location.search.indexOf('webpack') > -1) {
    console.log('Pointing at webpack dev server');
    payURL = 'http://pay.webpack:8080/webpack-dev-server/';
  }

  // Configuration for FxA and the URLs. This example site has to work locally
  // and on our pay server on AWS.
  var configMap = {
    'pay.dev': {
      fxa: {
        redirectUri: 'http://pay.dev/',
        client_id: '487e639f210d112d',
        client_secret: '6105ec8d4294a4d0cd8e8b8e0bc016eb8ba6eaf1aa0baff059af828a702bfe4b',
      },
      paymentUrl: payURL,
      manageUrl: payURL + 'management.html',
    },
    'pay.dev.mozaws.net': {
      fxa: {
        redirectUri: 'http://pay.dev.mozaws.net/',
        // Note that these are just throwaway *example* credentials.
        // https://oauth-stable.dev.lcip.org/console/client/7d778aed131ec1ba
        client_id: '7d778aed131ec1ba',
        client_secret:
          '34ca7cf742b37dcea996280bf1cbb861e181d78ef90ccecdba7185c7f22bc164',
      },
      paymentUrl: 'http://pay.dev.mozaws.net:8000/',
      manageUrl: 'http://pay.dev.mozaws.net:8000/management.html',
    },
  };

  var config = configMap[window.location.hostname];
  if (typeof config === 'undefined') {
    throw new Error('no configuration for this domain');
  }

  var fxaRelierClient = new FxaRelierClient(config.fxa.client_id, {
    contentHost: 'https://stable.dev.lcip.org',
    oauthHost: 'https://oauth-stable.dev.lcip.org/v1',
  });

  function purchase(product) {
    console.log('signing in for purchase');

    fxaSignIn()
      .then(function(result) {
        // Start a payment flow with the token.
        console.log('starting payment flow');
        var client = new window.PaymentsClient({
          httpsOnly: false, // This is an example don't use this in prod.
          accessToken: result.access_token,
          product: product,
          paymentHost: config.paymentUrl,
        });
        client.show();
      });
  }

  function fxaSignIn() {
    return new Promise(function(resolve, reject) {
      fxaRelierClient.auth.signIn({
          // If we set state to a random string and verify that it matches
          // on the return then we'd get some CSRF protection. However,
          // it may only apply to redirect returns, I'm not sure.
          state: 'none',
          ui: 'lightbox',
          redirectUri: config.fxa.redirectUri,
          // The seller would need to request an access token with these
          // scopes for payments to work.
          scope: 'profile:email payments',
        })
        .then(function(res) {
          console.log('login succeeded:', res);
          console.log('requesting token for code', res.code);
          $.ajax({
              type: 'post',
              url: 'https://oauth-stable.dev.lcip.org/v1/token',
              dataType: 'json',
              data: {
                code: res.code,
                client_id: config.fxa.client_id,
                client_secret: config.fxa.client_secret,
              },
            })
            .then(function(result) {
              console.log('token result:', result);
              resolve(result);
            }, function(err) {
              console.error('token failure:', err.responseJSON);
              reject(err);
            });

        }, function(err) {
          console.error('sign-in failure:', err);
          reject(err);
        });
    });
  }

  // This is where we call the purchase method. Since we have multiple
  // buy buttons on this one page, we'll use a function to avoid
  // copying and pasting the code.
  $('button.brick').on('click', function(event) {
    purchase({
      'id': 'mozilla-concrete-brick',
      'image': 'http://bit.ly/default-png'
    });
  });

  $('button.mortar').on('click', function(event) {
    purchase({
      'id': 'mozilla-concrete-mortar',
      'image': 'http://bit.ly/mortar-png'
    });
  });

  $('button.management').on('click', function(event) {
    window.location = config.manageUrl;
  });
  
})();

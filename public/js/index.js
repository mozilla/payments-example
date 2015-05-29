(function() {

  /*global $, FxaRelierClient*/

  // The client ID/secret is set up here:
  // https://oauth-stable.dev.lcip.org/console/client/487e639f210d112d
  // TODO: update this client per
  // https://mail.mozilla.org/pipermail/dev-fxacct/2015-April/001431.html
  // It requires the site to be running from http://pay.dev

  // WARNING: this is just an example app. In a real app you wouldn't
  // expose your client secret to client side code.
  var fxaConfigMap = {
    'pay.dev': {
      redirectUri: 'http://pay.dev/',
      client_id: '487e639f210d112d',
      client_secret:
        '6105ec8d4294a4d0cd8e8b8e0bc016eb8ba6eaf1aa0baff059af828a702bfe4b',
    },
    'pay.dev.mozaws.net': {
      redirectUri: 'http://pay.dev.mozaws.net',
      client_id: '61bf2e47b8118f12',
      client_secret:
        'f8fa58928db19ba69bd78b0cad833eaa9eb667e44cf175b5f4f81918b87587fa',
    },
  };

  var fxaConfig = fxaConfigMap[window.location.hostname];

  var fxaRelierClient = new FxaRelierClient(fxaConfig.client_id, {
    contentHost: 'https://stable.dev.lcip.org',
    oauthHost: 'https://oauth-stable.dev.lcip.org/v1',
  });

  function signIn() {
    console.log('signing in');

    var product = $(this).data('productKey');
    console.log('Got product:', product);

    fxaRelierClient.auth.signIn({
      // If we set state to a random string and verify that it matches
      // on the return then we'd get some CSRF protection. However,
      // it may only apply to redirect returns, I'm not sure.
      state: 'none',
      ui: 'lightbox',
      redirectUri: fxaConfig.redirectUri,
      scope: 'profile payments',
    })
    .then(function (res) {
      console.log('login succeeded:', res);
      console.log('requesting token for code', res.code);
      $.ajax({
        type: 'post',
        url: 'https://oauth-stable.dev.lcip.org/v1/token',
        dataType: 'json',
        data: {
          code: res.code,
          client_id: fxaConfig.client_id,
          client_secret: fxaConfig.client_secret,
        },
      })
      .then(function(result) {
        console.log('token result:', result);
        // Start a payment flow with the token.
        var client = new window.PaymentsClient({
          httpsOnly: false, // This is an example don't use this in prod.
          accessToken: result.access_token,
          product: product,
        });
        client.show();
      }, function(err) {
        console.error('token failure:', err.responseJSON);
      });

    }, function (err) {
      console.error('sign-in failure:', err);
    });
  }

  $('button.pay').on('click', signIn);

})();

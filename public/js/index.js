(function() {

  // The client ID/secret is set up here:
  // https://oauth-stable.dev.lcip.org/console/client/487e639f210d112d
  // TODO: update this client per https://mail.mozilla.org/pipermail/dev-fxacct/2015-April/001431.html
  // It requires the site to be running from http://pay.dev

  var fxaRelierClient = new FxaRelierClient("487e639f210d112d", {
    contentHost: 'https://stable.dev.lcip.org',
    oauthHost: 'https://oauth-stable.dev.lcip.org/v1',
  });

  $('button#signin').on('click', signIn);

  // TODO: when we have actual products this should do more.
  $('button.pay').on('click', signIn);


  function signIn() {
    console.log('signing in');

    var product = $(this).data('productKey');
    console.log('Got product:', product);

    fxaRelierClient.auth.signIn({
      // If we set state to a random string and verify that it matches on the return then we'd get
      // some CSRF protection. However, it may only apply to redirect returns, I'm not sure.
      state: 'none',
      ui: 'lightbox',
      redirectUri: 'http://pay.dev/',
      scope: 'profile payments'
    })
    .then(function (result) {
      console.log('login succeeded:', result);

      console.log('requesting token for code', result.code);

      $.ajax({
        type: 'post',
        url: 'https://oauth-stable.dev.lcip.org/v1/token',
        dataType: 'json',
        data: {
          code: result.code,
          client_id: "487e639f210d112d",
          // WARNING: this is just an example app. In a real app you wouldn't expose your client
          // secret to client side code.
          client_secret: "6105ec8d4294a4d0cd8e8b8e0bc016eb8ba6eaf1aa0baff059af828a702bfe4b",
        }
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

})();

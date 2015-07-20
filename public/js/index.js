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

  var configMap = {
    'pay.dev': {
      fxa: {
        redirectUri: 'http://pay.dev/',
        client_id: '487e639f210d112d',
        client_secret:
          '6105ec8d4294a4d0cd8e8b8e0bc016eb8ba6eaf1aa0baff059af828a702bfe4b',
      },
      paymentUrl: payURL,
    },
    'pay.dev.mozaws.net': {
      fxa: {
        redirectUri: 'http://pay.dev.mozaws.net/',
        client_id: 'bd143c82a3795038',
        client_secret:
          '5593c8cb7003379fb6dae2f8c0df12282f915a9e9dfa865326745bcc00c0dbd0',
      },
      paymentUrl: 'http://pay.dev.mozaws.net:8000/',
    },
  };

  loadProducts();

  $('#products').on('click', 'button.pay', function(event) {
    var productId = $(this).data('productId');
    var productImage = $(this).data('productImage');
    purchase({id: productId, image: productImage});
  });

  var config = configMap[window.location.hostname];
  if (typeof config === 'undefined') {
    throw new Error('no configuration for this domain');
  }

  var fxaRelierClient = new FxaRelierClient(config.fxa.client_id, {
    contentHost: 'https://stable.dev.lcip.org',
    oauthHost: 'https://oauth-stable.dev.lcip.org/v1',
  });


  // Helper functions:

  function loadProducts() {
    // This is pretty awkward. We should node-ify the config library.
    var emptied = false;
    [
      'mozilla-concrete-brick.json',
      'mozilla-concrete-mortar.json',

    ].forEach(function(file) {
      var root = $('#product-listing ul');

      $.getJSON('lib/js/mozilla-payments-config/products/' + file,
        function(data) {
          if (!emptied) {
            root.empty();
            emptied = true;
          }
          console.log('loading product for display', data);

          var product = $('<li>', {class: 'product'});
          product.append($('<div>', {
            class: 'product-image',
            style: 'background-image: url(' + data.img + ')',
          }));
          var button = $('<button>', {
            'class': 'pay',
            'data-product-id': data.id,
            'data-product-image': data.img,
          });
          button.text(data.currency + ' ' + data.amount + '/mo');
          product.append(button);
          product.append($('<h3>' + data.description.en + '</h3>'));
          product.append($('<div>', {class: 'clear'}));

          root.append(product);
        })
        .fail(function() {
          console.error('failed to get product JSON data');
        });
    });
  };


  function purchase(product) {
    console.log('signing in');

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
    .then(function (res) {
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
        // Start a payment flow with the token.
        var client = new window.PaymentsClient({
          httpsOnly: false, // This is an example don't use this in prod.
          accessToken: result.access_token,
          product: product,
          paymentHost: config.paymentUrl,
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

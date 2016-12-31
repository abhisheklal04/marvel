# Marvel Characters
Demo http://abhisheklal04-001-site7.gtempurl.com/

You can search your favourite marvel comics characters, read their description and no of comics available about them.
App Technology : Angular.js Angular ui-grid , Bootstrap css framework.

Features:
  1. Search character by name.
  2. Characters are displayed page by page.
  3. Requests from mavel server are cached to prevent the identical datafetch from server.
  4. Application can cache 10 recent character requests from marvel server nut can be changed in appProperties.js


To Deploy this application on your side, follow the guidelines given below.
  1. Fork the repository
  2. Create an account on https://developer.marvel.com
  3. Get your API public key and add your custom domain name on https://developer.marvel.com/account page.
  3. Change the MARVEL_API_PUBLIC_KEY with your own public key in appProperties.js . without your account public key the application cannot fetch the data from the marvel server.
  4. Deploy the website on your custom domain.

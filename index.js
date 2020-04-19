addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// gets a random number between [min, max]
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

// fetch response from variant
async function fetchVariantData(variant) {
  let y = await fetch(variant).then(
      (data) => {
        return data;
      });
  return y;
}

// event handler for html rewriter 
class ElementHandler {
  constructor(whichVariant) {
    this.whichVariant = whichVariant
  }
  element(element) {

    // update first variant's html
    if (this.whichVariant >= 0.5) {
      // update webpage title
      if (element.tagName === 'title') {
        element.setInnerContent("Kobe Bryant", {html: true});
      }
      // update header
      if ((element.tagName == 'h1') && (element.getAttribute('id') == 'title')) {
        element.setInnerContent('The Black Mamba', {html: true});
      }
      // update paragraph description
      if ((element.tagName == 'p') && (element.getAttribute('id') == 'description')) {
          element.setInnerContent('Kobe Bryant is the best basketball player to ever exist, and I am so devastated ' +
                                  'that he is no longer with us.' +
                                  ' May the Black Mamba\'s spirit live on through the young athletes in the world.', {html: true});
      }
      // update link
      if ((element.tagName == 'a') && (element.getAttribute('id') == 'url')) {
          element.setInnerContent('Dear Basketball... ', {html: true});
          element.setAttribute('href', 'https://www.theplayerstribune.com/en-us/articles/dear-basketball')
          element.setAttribute('style', 'background-color:#9626dc;');
      }
    }

    // update second variant's html
    else {
      // update webpage title
      if (element.tagName === 'title') {
        element.setInnerContent("Tiger Woods", {html: true});
      }
      // update header
      if ((element.tagName == 'h1') && (element.getAttribute('id') == 'title')) {
        element.setInnerContent('#1 Golfer of All Time', {html: true});
      }
      // update paragraph description
      if ((element.tagName == 'p') && (element.getAttribute('id') == 'description')) {
          element.setInnerContent('Tiger Woods is no doubt the best golfer of all time. ' +
                                  '2020 Masters Champion? (Just in time for my birthday too!)', {html: true});
      }
      // update link
      if ((element.tagName == 'a') && (element.getAttribute('id') == 'url')) {
          element.setInnerContent('A Legend On and Off the Course ', {html: true});
          element.setAttribute('href', 'https://tigerwoods.com')
          element.setAttribute('style', 'background-color:#bd0101;');
      }
    }
  }
}


async function handleRequest(request) {

  // fetches json from link specified
  const res = await fetch('https://cfw-takehome.developers.workers.dev/api/variants').then(
              (response) => {
                return response.json();
              }).then((data) => {
                return data;
              });

  // chooses random variant to send user to
  let random = Math.random();

  // attempt at creating a persistent web page with cookies
  // grabs random number stored in cookie to determine
  // which variant was visited last
  const cookie = getCookie(request, 'which-variant')
  if (cookie) random = cookie;

  // picks variant
  let variant; 
  if (random >= 0.5) variant = await fetchVariantData(res.variants[0]);
  else variant = await fetchVariantData(res.variants[1]);

  // returns the customized variant!
  // uncomment line below for non-cookie implementation
  // return new HTMLRewriter().on('*', new ElementHandler(random)).transform(variant);

  // customizes variant with info on Kobe and Tiger Woods!
  const custom = new HTMLRewriter().on('*', new ElementHandler(random)).transform(variant);

  // adds cookies (in headers) -- uses the cookie to specify which variant was previously
  // visited. expires 1 hour first visit
  // attempt at creating a persistent web page...
  let header = new Headers(custom.headers);
  var exp_date = new Date();
  exp_date.setHours(exp_date.getHours() + 1); 
  header.set('set-cookie', 'which-variant=' + random + '; expires=' + exp_date.toUTCString());
  
  return new Response(await custom.text(), {
		headers: header
  });
  
}

/**
 * Grabs the cookie with name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 */
// from cloudflare workers templates
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

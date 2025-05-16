// Debug script to diagnose Netlify deployment issues
(function() {
  console.log('==== Netlify Deployment Debug ====');
  console.log('Debug script loaded at:', new Date().toString());
  console.log('Document readyState:', document.readyState);
  
  // Log window location information
  console.log('Location:', {
    href: window.location.href,
    origin: window.location.origin,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  });

  // Log loaded CSS and JS files
  console.log('Loaded scripts:', Array.from(document.scripts).map(s => s.src || 'inline script'));
  console.log('Loaded stylesheets:', Array.from(document.styleSheets).map(s => {
    try {
      return s.href || 'inline style';
    } catch (e) {
      return 'cross-origin stylesheet';
    }
  }));

  // Check for necessary DOM elements
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    console.log('Root element exists:', !!document.getElementById('root'));
    console.log('App element exists:', !!document.getElementById('app'));
  });

  // Log when the page is fully loaded
  window.addEventListener('load', () => {
    console.log('Window load event fired');
    console.log('Document ready state at load:', document.readyState);
    
    // Check for React mounting issues
    setTimeout(() => {
      console.log('DOM after 1s:', {
        bodyChildren: document.body.children.length,
        rootContent: document.getElementById('root') ? 
          document.getElementById('root').children.length : 'no root',
        appContent: document.getElementById('app') ? 
          document.getElementById('app').children.length : 'no app'
      });
    }, 1000);
  });
  
  // Log errors
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error ? event.error.stack : 'No error stack'
    });
  });
})();

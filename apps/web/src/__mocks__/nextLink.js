const React = require('react');
const NextLink = ({ href, children, className, ...props }) =>
  React.createElement('a', { href, className, ...props }, children);
NextLink.displayName = 'Link';
module.exports = NextLink;
module.exports.default = NextLink;

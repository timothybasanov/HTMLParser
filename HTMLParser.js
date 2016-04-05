/*
 * HTMLParser parses HTML and provides SAX-like interface,
 * (http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html).
 * 
 * It is not dissimilar to HTML Parser By John Resig (ejohn.org),
 * but properly supports DOCTYPE and uses DOMParser as an implementation.  
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 * Check for browser compatibility before usage.
 *
 * Caveats: 
 * Depends on jQuery for html escaping. 
 * Tag names are lowercased.
 * Certain tags change name, <image> to <img>.
 * <html>, <head> and <body> are always added to create a valid html document.
 */

/**
 * Main exported function. Pass in html and callbacks to process the data.
 * callbacks:
 *    startDocument()
 *    endDocument()
 *    characters(rawString, text)
 *    startElement(rawString, name, attributes)
 *    endElement(rawString, name)
 *    notationDecl(rawString, name, publicId, systemId)
 *    comment(rawString, comment)
 * rawString is close to original HTML text. Concatenation of rawStrings
 * should give you document that is close to original.
 */
var HTMLParser = function (html, callbacks) {
  for (var callback of [
      "startDocument", "endDocument", "characters", "startElement", 
      "endElement", "notationDecl", "comment"]) {
    if (!callbacks[callback]) callbacks[callback] = function() {};
  }

  function htmlEncode(value){
    // http://stackoverflow.com/questions/1219860
    return $('<div/>').text(value).html();
  }
  var parseElement = function (node) {
    var rawString = "<" + node.localName;
    for (var i=0; i<node.attributes.length; i++) {
      var attribute = node.attributes[i];
      rawString += " " + attribute.localName + "=\"" 
          + htmlEncode(attribute.nodeValue) + "\""; 
    }
    rawString += ">";
    callbacks.startElement(rawString, node.localName, node.attributes);
    parseNodes(node.childNodes);
    callbacks.endElement("</" + node.localName + ">", node.localName);
  };
  var parseText = function (node) {
    callbacks.characters(
      $('<div/>').text(node.textContent).html(), 
      node.textContent);
  };
  var parseComment = function (node) {
    callbacks.comment("<!--" + node.nodeValue + "-->", 
      node.nodeValue);
  };
  var parseDocument = function (node) {
    callbacks.startDocument();
    parseNodes(node.childNodes);
    callbacks.endDocument();
  };
  var parseDocumentType = function (node) {
    var rawString = "<!DOCTYPE " + node.nodeName;
    if (node.publicId != null) {
      rawString += " PUBLIC \"" + node.publicId + "\"";
    }
    if (node.systemId != null) {
      rawString += " \"" + node.systemId + "\""
    }
    rawString += ">\n";
    callbacks.notationDecl(
      rawString,
      node.nodeName,
      node.publicId,
      node.systemId);
  };
  var parseNodes = function (nodes) {
    for (var i=0; i<nodes.length; i++) {
      var node = nodes[i];
      switch (node.nodeType) {
        case node.ELEMENT_NODE: parseElement(node); break;
        case node.TEXT_NODE: parseText(node); break;
        case node.COMMENT_NODE: parseComment(node); break;
        case node.DOCUMENT_TYPE_NODE: parseDocumentType(node); break;
        default: throw "Unknown node type: " + node.nodeType;
      }
    }
  };

  var document = new DOMParser().parseFromString(html, "text/html");
  parseDocument(document);
}
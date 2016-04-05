var parseAndRerenderHtml = function (html) {
  var renderHtml = "";
  var renderRaw = function(rawString) { 
    renderHtml += rawString 
  };
  HTMLParser(html, {
    characters: renderRaw,
    startElement: renderRaw,
    endElement: renderRaw,
    notationDecl: renderRaw,
    comment: renderRaw,
  });
  return renderHtml;
}

QUnit.test( "TextNodeTest", function( assert ) {
  assert.equal(
    parseAndRerenderHtml('Text &gt;'), 
    "<html><head></head><body>Text &gt;</body></html>");

  var escaped = "";
  HTMLParser('Text &gt;', {
    characters: function (rawString, text) { escaped += text }
  });
  assert.equal(escaped, "Text >");
});

QUnit.test( "ElementNodeTest", function( assert ) {
  // note that <Image> is converted into <img>
  assert.equal(
    parseAndRerenderHtml('<Image href="&lt;">text</Image>'), 
    '<html><head></head><body><img href=\"&lt;\"></img>text</body></html>');
});

QUnit.test( "NamespaceTest", function( assert ) {
  var html = '<html><head></head><body><f:table xmlns:f=\"http://www.w3schools.com/furniture\">\n\
  <f:name>African Coffee Table</f:name>\n\
</f:table></body></html>';
  assert.equal(parseAndRerenderHtml(html), html); 
});

QUnit.test( "AllTypesOfNodesTest", function( assert ) {
  var html = '<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">\n\
<html><head></head><body>\n\
  <!-- Comment test &gt; -->\n\
  Text test &gt;\n\
\n\
</body></html>';

  assert.equal(parseAndRerenderHtml(html), html);
});
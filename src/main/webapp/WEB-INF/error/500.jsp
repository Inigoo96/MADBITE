<%@ page isErrorPage="true" contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html>
<head><title>Oops – Error interno</title></head>
<body>
<h1>¡Algo salió mal!</h1>
<p>Ha ocurrido un error inesperado. Por favor, inténtalo más tarde.</p>

<%-- Solo en desarrollo: muestra la traza --%>
<pre>
<%= pageContext.getException() %>
</pre>
</body>
</html>

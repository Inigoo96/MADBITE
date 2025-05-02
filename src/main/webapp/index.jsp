<%@ page session="false" contentType="text/html; charset=UTF-8" %>
<%
    // Obtener la URL base dinámicamente para que funcione con cualquier puerto
    String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
    String contextPath = request.getContextPath();

    // Solo redirige si es necesario
    String requestURI = request.getRequestURI();
    if (requestURI.equals(contextPath + "/") || requestURI.equals(contextPath + "/index.jsp")) {
        response.sendRedirect("http://localhost:3001/index.html");
    }
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MADBITE API</title>
</head>
<body>
<p>Si ves esta página es porque has accedido directamente al backend.<br>
La interfaz web está en
<a href="http://localhost:3001/index.html">http://localhost:3001/index.html</a>.
</p>
</body>
</html>
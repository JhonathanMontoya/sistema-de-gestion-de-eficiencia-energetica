EnerGest — Sistema personal de gestión de eficiencia energética en el hogar
Introducción

Comprender el consumo de energía en el hogar requiere organizar información de los aparatos y de las facturas o lecturas disponibles. Cuando estos datos se encuentran dispersos, resulta difícil reconocer qué se ha registrado, comparar periodos y decidir qué conviene revisar. Enmarcado en el ODS 12 (Producción y consumo responsable), EnerGest propone una aplicación web personal para registrar aparatos, estimar su consumo habitual, guardar lecturas manuales del hogar y mostrar avisos y recomendaciones comprensibles.

Definición del problema

En el uso doméstico, la información sobre consumo suele estar repartida entre facturas, etiquetas de aparatos y registros personales. Además, una estimación calculada a partir de la potencia y las horas de uso no equivale a una medición del aparato ni al consumo total facturado en el hogar. La falta de una herramienta que organice y distinga estas fuentes puede dificultar la lectura de los datos y la identificación de cambios que merecen atención.

Pregunta orientadora: ¿cómo puede una aplicación web personal facilitar el registro y la comprensión del consumo energético de los aparatos y del hogar, distinguiendo las estimaciones de las lecturas registradas?

Justificación
Ambiental: promueve una observación más consciente del uso de energía en el hogar, en relación con el ODS 12.
Económica: permite registrar una tarifa editable en pesos colombianos y consultar valores estimados; estos cálculos no garantizan ahorros ni sustituyen la factura del servicio.
Formativa: aplica conceptos de desarrollo web full-stack a una necesidad cotidiana y de interés social.
Accesibilidad: ofrece una interfaz web para organizar información que el usuario ingresa, sin requerir integración con medidores inteligentes.
Objetivos
Objetivo general

Desarrollar una aplicación web personal que permita organizar aparatos y lecturas del hogar, consultar estimaciones y avisos explicables, y apoyar decisiones informadas sobre el uso de energía.

Objetivos específicos
Implementar registro e inicio de sesión, con acceso a los datos limitado a la cuenta autenticada.
Gestionar aparatos personales con categoría, potencia y horas habituales de uso para calcular estimaciones identificadas como tales.
Registrar por separado lecturas de aparatos y lecturas manuales del consumo total del hogar, conservando el periodo y la fuente indicada.
Guardar por cuenta la tarifa editable en COP/kWh y límites diarios y mensuales para aparatos y hogar.
Mostrar avisos dentro de la aplicación cuando los cálculos disponibles superen los límites configurados, indicando su fuente y periodo de referencia.
Presentar recomendaciones deterministas asociadas a los aparatos y al contenido educativo administrado; no se usa inteligencia artificial.
Permitir al administrador gestionar cuentas, roles y contenido editorial de la página, sin concederle acceso a los datos privados de consumo de las cuentas.
Proteger las rutas y operaciones con autenticación, autorización por rol y validación en el servidor.

Alcance y limitaciones de la versión

La versión actual está orientada a cuentas individuales. Los hogares compartidos y la relación entre varias cuentas y un hogar quedan para una etapa posterior. El consumo por aparato se estima con los datos que registra el usuario; las lecturas del total del hogar son datos manuales. Los avisos se calculan al consultar la aplicación y no constituyen una bandeja histórica ni notificaciones por correo o teléfono. La aplicación no integra medidores inteligentes ni un proveedor de inteligencia artificial. La tarifa editable y las proyecciones son referencias configuradas por el usuario, no tarifas oficiales ni promesas de ahorro.

La administración de usuarios y contenidos es una función de gestión de la plataforma. Por privacidad, el rol administrador no consulta consumos privados de otras cuentas. La gestión de hogares compartidos, los reportes institucionales y la integración con organizaciones no forman parte de esta versión.

Marco Teórico



Eficiencia y gestión energética: uso de información sobre energía para comprender patrones y evaluar oportunidades de mejora sin perder de vista las condiciones de uso. EnerGest ofrece registros y estimaciones de apoyo; no mide por sí mismo el consumo real ni certifica un sistema de gestión energética.



ODS 12 (Producción y consumo responsable): marco de la Agenda 2030 relacionado con patrones de consumo sostenibles. El proyecto toma este objetivo como contexto educativo y promueve que el usuario observe la información energética de su hogar; no calcula ni atribuye una reducción ambiental automática.



Sistemas de información: conjunto de datos, procesos y tecnología que capturan y organizan información para apoyar decisiones. Sustituyen métodos manuales (como hojas de cálculo) por un registro centralizado y accesible.



Arquitectura cliente-servidor: el frontend gestiona la interacción con el usuario y el backend la lógica de negocio, comunicándose mediante una API HTTP. Este proyecto usa React en el frontend y Node.js con Express en el backend, separando rutas, controladores, servicios, reglas de dominio y modelos de persistencia.



Bases de datos NoSQL: almacenan información en documentos flexibles (como MongoDB), a diferencia de las tablas fijas de una base relacional. Facilita que la estructura de datos evolucione entre sprints.



Autenticación y seguridad: los JSON Web Tokens (JWT) permiten autenticar solicitudes y bcrypt se utiliza para almacenar contraseñas mediante hash. La autorización y la propiedad de los datos deben comprobarse en el servidor para cada operación protegida.



Metodologías ágiles: el desarrollo por sprints entrega incrementos funcionales en periodos cortos, permitiendo validar avances y ajustar prioridades. Las historias de usuario documentan los requerimientos desde la perspectiva de quien usará el sistema.


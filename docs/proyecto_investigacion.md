EnerGest — Sistema de Gestión de Eficiencia Energética
Introducción

El consumo energético ineficiente afecta tanto la sostenibilidad ambiental como la rentabilidad de las organizaciones. Muchas instalaciones no cuentan con herramientas accesibles para registrar y monitorear su consumo, lo que dificulta detectar desperdicios a tiempo. Este proyecto, enmarcado en el ODS 12 (Producción y consumo responsable), propone EnerGest, un sistema web para registrar dispositivos, llevar historial de consumo y recibir alertas cuando se superen límites definidos.

Definición del problema

Las organizaciones suelen carecer de un registro centralizado de qué equipos consumen energía y cuánto. Sin un historial periódico, es difícil saber si las medidas de eficiencia funcionan o si el consumo aumenta con el tiempo. Al no existir alertas, los problemas suelen detectarse solo hasta que llega la factura, cuando ya no se puede actuar. Muchas organizaciones pequeñas manejan esto en hojas de cálculo desorganizadas, por no contar con un sistema dedicado y de bajo costo.

Pregunta orientadora: ¿cómo facilitar el registro, monitoreo y análisis del consumo energético de una organización, de forma accesible y sin infraestructura costosa?

Justificación
Ambiental: reduce el desperdicio al hacer visible el consumo real y sus tendencias.
Económico: permite identificar ahorros antes de que se conviertan en sobrecostos.
Formativo: aplica conceptos de desarrollo full-stack sobre un caso con propósito social.
Accesibilidad: usa tecnologías gratuitas (React, Node/Express, MongoDB Atlas), viable incluso para organizaciones pequeñas.
Objetivos
Objetivo general

Desarrollar un sistema web que permita registrar, monitorear y analizar el consumo energético de los dispositivos de una operación, para facilitar decisiones orientadas a la eficiencia.

Objetivos específicos
Implementar autenticación (registro, login, logout) que garantice acceso individual a cada usuario.
Construir un módulo de gestión de dispositivos (crear, ver, editar, eliminar).
Registrar lecturas de consumo por dispositivo para construir un historial.
Analizar consumo total y comparaciones entre periodos.
Notificar al usuario cuando el consumo supere un límite definido.
Generar reportes con el historial de consumo.
Garantizar la seguridad de la información (contraseñas protegidas, control de acceso por sesión).

Marco Teórico



Eficiencia y gestión energética: capacidad de reducir el consumo de energía sin afectar la calidad del servicio prestado. La gestión energética planifica, monitorea y controla ese consumo para identificar ahorros, siguiendo el ciclo de mejora continua que promueven estándares como la ISO 50001.



ODS 12 (Producción y consumo responsable): objetivo de la Agenda 2030 que busca garantizar patrones de consumo sostenibles. La gestión eficiente de la energía reduce directamente el impacto ambiental de una organización.



Sistemas de información: conjunto de datos, procesos y tecnología que capturan y organizan información para apoyar decisiones. Sustituyen métodos manuales (como hojas de cálculo) por un registro centralizado y accesible.



Arquitectura cliente-servidor: el frontend gestiona la interacción con el usuario y el backend la lógica de negocio, comunicándose mediante una API HTTP. Este proyecto usa React en el frontend y Node.js con Express en el backend, con arquitectura por capas (rutas, controladores, modelos).



Bases de datos NoSQL: almacenan información en documentos flexibles (como MongoDB), a diferencia de las tablas fijas de una base relacional. Facilita que la estructura de datos evolucione entre sprints.



Autenticación y seguridad: los JSON Web Tokens (JWT) mantienen la sesión de un usuario sin que el servidor deba recordar su estado. Las contraseñas se protegen con funciones de hash (bcrypt), que las vuelven irreversibles.



Metodologías ágiles: el desarrollo por sprints entrega incrementos funcionales en periodos cortos, permitiendo validar avances y ajustar prioridades. Las historias de usuario documentan los requerimientos desde la perspectiva de quien usará el sistema.


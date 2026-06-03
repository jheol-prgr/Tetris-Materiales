# Tetris de Materiales

Juego de Tetris educativo hecho con HTML, CSS, JavaScript y Phaser 3. La mecanica principal combina el Tetris clasico con una simulacion simple de fluidos y materiales: cada mundo cambia la velocidad de caida y cada material modifica la densidad de las piezas.

## Caracteristicas

- Tetris clasico con tablero de 10 x 20.
- Renderizado con Phaser 3.
- Seleccion de mundos/fluidos:
  - Miel
  - Aceite
  - Agua
  - Gasolina
  - Alcohol
  - Mercurio
- Seleccion de materiales:
  - Corcho
  - Madera
  - Plastico
  - Piedra
  - Hierro
  - Plomo
- Velocidad combinada segun fluido y material.
- Pieza fantasma para previsualizar la caida.
- Vista de la siguiente pieza.
- Marcadores de puntuacion, lineas y nivel.
- Tooltips educativos con datos de densidad e interacciones entre materiales y liquidos.
- Interfaz responsive con estilos personalizados.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Phaser 3.87.0, cargado desde CDN
- Google Fonts, fuente Outfit

## Estructura del Proyecto

```text
tetris-js-10/
├── index.html
├── tetris.css
├── tetris.js
└── README.md
```

## Como Ejecutarlo

Este proyecto no requiere instalacion de dependencias locales.

1. Abre `index.html` en un navegador moderno.
2. Asegurate de tener conexion a internet para cargar Phaser desde CDN.
3. Tambien puedes servir la carpeta con un servidor local, por ejemplo:

```bash
python -m http.server 8000
```

Luego abre:

```text
http://localhost:8000
```

## Controles

| Accion | Teclas |
| --- | --- |
| Mover a la izquierda | Flecha izquierda o A |
| Mover a la derecha | Flecha derecha o D |
| Bajar pieza | Flecha abajo o S |
| Rotar pieza | Flecha arriba o W |
| Caida rapida | Espacio |
| Reiniciar | R |

Cuando aparece la pantalla de fin de juego, tambien puedes reiniciar con un clic.

## Como se Juega

1. Elige un mundo en la parte superior/lateral de la interfaz.
2. Selecciona el material de las piezas.
3. Observa como cambia la velocidad de caida segun la combinacion elegida.
4. Completa lineas horizontales para sumar puntos.
5. Cada 10 lineas aumenta el nivel y la dificultad.

## Mundos y Fluidos

Cada mundo representa un fluido con un multiplicador de velocidad distinto:

| Mundo | Efecto |
| --- | --- |
| Miel | Caida muy lenta |
| Aceite | Caida lenta |
| Agua | Velocidad normal |
| Gasolina | Caida rapida |
| Alcohol | Caida muy rapida |
| Mercurio | Caida extremadamente rapida |

## Materiales

Los materiales modifican la velocidad final segun su densidad:

| Material | Comportamiento |
| --- | --- |
| Corcho | Muy ligero |
| Madera | Ligero |
| Plastico | Casi neutro |
| Piedra | Denso |
| Hierro | Muy denso |
| Plomo | Extremadamente denso |

## Archivos Principales

- `index.html`: estructura de la interfaz, paneles de mundos, materiales y contenedor del juego.
- `tetris.css`: estilos visuales, layout responsive, paneles, botones, tooltips y efectos.
- `tetris.js`: logica del Tetris, configuracion de fluidos/materiales, renderizado con Phaser, controles y eventos de UI.

## Notas

- Phaser se carga desde `https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js`.
- Si el juego no aparece, revisa la conexion a internet o usa una copia local de Phaser.
- El proyecto esta pensado como una experiencia interactiva y educativa sobre densidad, viscosidad y velocidad de caida.

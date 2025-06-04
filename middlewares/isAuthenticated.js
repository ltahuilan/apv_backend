import jwt from "jsonwebtoken";
import Veterinarian from "../models/Veterinarian.js";

const isAutenticated = async (req, res, next) => {
    let token;

    //si no se recibió un token o si no es Bearer
    if (!req.headers.authorization || (req.headers.authorization && !req.headers.authorization.startsWith("Bearer")) ) {
        const error = new Error("Token no valido o no es Bearer");
        return res.status(401).json({"message" : error.message});
    }
    
    //Intento de verificar el token
    try {
        // Divide "Bearer <token>" y toma la segunda parte
        token = req.headers.authorization.split(' ')[1];

        //verificar si el token es valido usando la clave secreta
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        
        //Adjuntar al objeto request el usuario obtenido
        req.veterinarian = await Veterinarian.findById(decode.id).select("-password -token -confirm");
        return next();

    } catch (error) {
        const err = new Error("Token no válido");
        return res.status(401).json({"message": err.message});
    }
}

export default isAutenticated;

/**

Claro, vamos a desglosar este código de middleware de autenticación en JavaScript.
---

### Explicación del Código

Este es un middleware común en aplicaciones Node.js (probablemente usando Express.js) que se encarga de verificar si un usuario está autenticado a través de un **JSON Web Token (JWT)**.

1.  **`import jwt from "jsonwebtoken";`**: Importa la librería `jsonwebtoken`, que se utiliza para firmar y verificar JWTs.
2.  **`import Veterinarian from "../models/Veterinarian.js";`**: Importa el modelo `Veterinarian`. Esto sugiere que estás trabajando con una base de datos y que los usuarios de tu aplicación son veterinarios, y cada uno tiene un registro en la tabla/colección `Veterinarian`.

---

### La Función `isAutenticated`

Esta función es un middleware, lo que significa que se ejecuta entre la solicitud del cliente y la respuesta del servidor. Recibe tres argumentos:
* `req`: El objeto de solicitud (request).
* `res`: El objeto de respuesta (response).
* `next`: Una función que, cuando se llama, pasa el control al siguiente middleware en la cadena o a la función de la ruta final.

```javascript
const isAutenticated = async (req, res, next) => {
    let token;

    // 1. Verificación inicial del encabezado de autorización
    if (!req.headers.authorization || (req.headers.authorization && !req.headers.authorization.startsWith("Bearer")) ) {
        const error = new Error("Token no valido o no es Bearer");
        res.status(401).json({"message" : error.message});
        return next(); // Llama a next() para finalizar el flujo de middleware y pasar al siguiente.
    }

    // 2. Intento de verificación del token
    try {
        // Extrae el token
        token = req.headers.authorization.split(' ')[1]; // Divide "Bearer <token>" y toma la segunda parte
        
        // Verifica el token
        const decode = jwt.verify(token, process.env.JWT_SECRET); // Verifica si el token es válido usando la clave secreta

        // 3. Obtener el usuario del token y adjuntarlo al request
        req.veterinarian = await Veterinarian.findById(decode.id).select("-password -token -confirm");
        
        // 4. Continuar al siguiente middleware/ruta
        return next();
        
    } catch (error) {
        // Manejo de errores si el token no es válido
        const err = new Error("Token no válido");
        return res.status(401).json({"message": err.message});
    }
}
```

---

### Explicación Detallada de `req.veterinarian`

La línea clave es:

```javascript
req.veterinarian = await Veterinarian.findById(decode.id).select("-password -token -confirm");
```

Aquí está lo que sucede paso a paso:

1.  **`decode.id`**: Después de que el JWT es verificado exitosamente (línea `const decode = jwt.verify(token, process.env.JWT_SECRET);`), el objeto `decode` contendrá la información que fue **cargada (payload)** en el token cuando fue creado. Comúnmente, un JWT contiene el ID del usuario (`id`). Por lo tanto, `decode.id` es el ID del veterinario autenticado.

2.  **`await Veterinarian.findById(decode.id)`**: Utiliza el modelo `Veterinarian` (que probablemente es un modelo Mongoose si estás usando MongoDB) para buscar en tu base de datos un documento de veterinario cuyo ID coincida con `decode.id`. El `await` indica que esta es una operación asíncrona y que el código esperará a que la consulta a la base de datos se complete.

3.  **`.select("-password -token -confirm")`**: Esto es una parte importante de la consulta de Mongoose. Significa que, cuando se recupere el documento del veterinario, **excluya** los campos `password`, `token` y `confirm`. Esto es una buena práctica de seguridad. No quieres que la contraseña del usuario (incluso si está hasheada) o tokens internos se envíen en el objeto `req` o se expongan accidentalmente.

4.  **`req.veterinarian = ...`**: El resultado de la consulta a la base de datos (es decir, el documento del veterinario encontrado, sin los campos excluidos) se **adjunta al objeto `req` (request)**.

**¿Por qué `req.veterinarian`?**

Cuando este middleware se ejecuta y el usuario es autenticado, es muy útil que las **rutas posteriores** (que este middleware protege) tengan acceso a la información del usuario que acaba de ser autenticado.

Al adjuntar el objeto `veterinarian` al `req`, cualquier manejador de ruta que venga después de `isAutenticated` en la cadena de middleware puede acceder directamente a `req.veterinarian` para obtener el ID del usuario, su nombre, correo electrónico, etc., sin tener que volver a buscarlo en la base de datos o decodificar el token de nuevo. Esto hace que el código sea más eficiente y limpio en las rutas protegidas.

**Ejemplo de uso en una ruta protegida:**

```javascript
// En tu archivo de rutas
import express from 'express';
import isAutenticated from '../middleware/isAutenticated.js';
import { getProfile } from '../controllers/veterinarianController.js'; // Una función para obtener el perfil

const router = express.Router();

// Esta ruta estará protegida por el middleware isAutenticated
router.get('/profile', isAutenticated, getProfile);

// En tu controlador (veterinarianController.js)
const getProfile = (req, res) => {
    // Aquí puedes acceder directamente al veterinario autenticado
    const veterinarian = req.veterinarian; // ¡Este es el objeto que adjuntaste!
    res.json({
        name: veterinarian.name,
        email: veterinarian.email,
        // ... otras propiedades que no sean sensibles
    });
};
```

---

### Feedback

1.  **Uso de `next()` después de `res.status().json()` en el `if`**:
    * En la primera verificación (`if (!req.headers.authorization || ...)`), llamas a `return next();` después de enviar la respuesta de error. Esto es un poco inusual y puede llevar a comportamientos inesperados. Cuando envías una respuesta con `res.status().json()`, la solicitud ya está "finalizada" desde el punto de vista del servidor. Llamar a `next()` después podría intentar pasar el control a otro middleware o ruta cuando ya se ha enviado una respuesta, lo cual no es lo que quieres.
    * **Recomendación:** Cuando envías una respuesta de error para detener el flujo, simplemente usa `return res.status(401).json({"message" : error.message});` y **no llames a `next()`**. Esto termina la ejecución de la función y la solicitud de inmediato.

    ```javascript
    // CÓDIGO SUGERIDO
    if (!req.headers.authorization || (req.headers.authorization && !req.headers.authorization.startsWith("Bearer")) ) {
        const error = new Error("Token no valido o no es Bearer");
        return res.status(401).json({"message" : error.message}); // Solo esto
    }
    ```

2.  **Manejo de errores consistente**:
    * En el `try...catch`, creas `const err = new Error("Token no válido");` y luego `return res.status(401).json({"message": err.message});`. Esto está bien. Es similar al error en la primera `if` pero el manejo de `next()` lo hace diferente. Mantener la consistencia en cómo se manejan y envían los errores (`res.status().json()` y `return`) mejora la legibilidad y previene bugs.

3.  **Nombre de la variable `decode`**:
    * El nombre `decode` es correcto, ya que el JWT está siendo decodificado. Sin embargo, a veces, para mayor claridad, se le podría llamar `payload` para indicar que es la carga útil del token. No es una crítica, solo una alternativa.

4.  **Consideraciones de rendimiento (menor):**
    * En un escenario de altísimo tráfico, hacer una consulta a la base de datos (`findById`) para **cada** solicitud autenticada puede sumar. Sin embargo, para la mayoría de las aplicaciones, esto es completamente aceptable y la forma más segura de asegurar que el usuario existe y no ha sido desactivado desde que se emitió el token. Solo si ves un cuello de botella extremo aquí, considerarías alternativas como almacenar en caché la información del usuario por un corto tiempo, pero para la autenticación, la consulta es la norma.

En general, es un middleware de autenticación sólido y bien estructurado que sigue las mejores prácticas para el uso de JWTs y la gestión de usuarios en Express.js.
 */


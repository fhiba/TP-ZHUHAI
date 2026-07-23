## Enunciado
11.⁠ ⁠Team Project: Design and Build an AI Agent or AI-Powered Product
Design and develop a small AI product prototype that addresses a real-world problem or user need. The project may take the form of an AI agent, intelligent chatbot, vision application, recommendation tool, learning assistant, creative tool, or another AI-enabled product. Students may use existing large language model APIs, open-source models, public datasets, low-code platforms, or AI development frameworks. The project does not require training a large model from scratch. Instead, it should demonstrate a clear problem definition, appropriate use of AI technologies, a functional prototype, and critical reflection on its value and risks.

## Restricciones y criteria

Group Presentation Scoring Criteria 
 
I. Content (40 pts)
 
Clear theme, sufficient content and evidence with original and in-depth viewpoints.
 
II. Delivery (30 pts)
 
Fluent speech, clear logic, natural posture and professional performance.
 
III. Teamwork (20 pts)
 
Reasonable division of labor, good cooperation and full team participation.
 
IV. Time Control (10 pts)
 
Strict 10 minute time limit, proper time arrangement and prominent key points.

## idea

### Gestor de turnos de lavarropa con computer vision
Usando una cámara podemos detectar si hay algún lavarropas libre, entonces los estudiantes se pueden encolar para recibir notificaciones de que está libre un lavarropa/secarropa. También te avisa cuando terminó y si no sacas la ropa en x tiempo, hay castigo

El plan es levantar una webapp simple que permita crear una cuenta y loguearse. Una vez que exista el usuario, tiene que existir un dashboard que tenga 3 lavarropas y 3 secarropas donde los usuarios puedan pedir para encolarse para la proxima maquina que necesiten que se liberen. (idealmente poder meter combo lavarropa secarropa). A traves del uso de computer vision, la webapp va a tener un live feed de las maquinas para poder informarle a los usuarios cuando este libre maquina y cuando haya terminado su ciclo. Si el usuario no usa su turno en x tiempo o no saca su ropa en x tiempo, se ve penalizado.

Cuando el usuario este por cargar la ropa, este sera detectado por la camara y se le enviara un one time link para verificar que efectivamente es el quien esta cargando la ropa. De esta manera podemos tratar de prevenir que la gente bypassee el sistema.

Es necesario: 
- Un front simple e intuitivo
- La estructura para poder tener un backend con lo de computer vision
- una bd sql para tener la informacion de los usuarios y de las maquinas

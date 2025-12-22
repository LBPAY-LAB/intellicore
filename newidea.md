Me ocorreu uma nova ideia que gostaria de validar com você:

Mantendo o conceito de Oraculo mas evoluindo:
1. Um Oraculo pode ser do tipo de front-end ou back-end
2. Se for do tipo front-end, então teremos outro tipos de objetos como de autenticação (IAM), menus laterais, e visão representar um portal com um layout de frames pre-definido e implementando também o seu proprio BFF;
3. Os Oraculos de Back-End, terão sempre nativamente interfaces via MCP se tornando building-blocks, conforme a especificação de objetos que tiver.
4. Com esta abordagem, uns Oraculos poderão se conectar a outros via MCP permitindo abstratamente criar um "grafo" de Oraculos, que em termos de arquitetura poderão rodar no mesmo cluster ou não.
5. No portal de SUperCore que gere a criação e a gestão de Oraculos, permitirá também a gestão de deploy dos mesmos a partir desse mesmo portal.

Está entendendo a ideia? Ou seja, quase nada muda no que precisamos de implementar, apenas estamos expandindo conceptualmente conceitos.

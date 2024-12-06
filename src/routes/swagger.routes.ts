/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *     Url:
 *       type: object
 *       required:
 *         - originalUrl
 *       properties:
 *         originalUrl:
 *           type: string
 *         shortCode:
 *           type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Realiza login do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 *
 * @swagger
 * /urls:
 *   post:
 *     tags: [URLs]
 *     summary: Cria uma nova URL encurtada (autenticação opcional)
 *     description: Se autenticado, a URL será associada ao usuário. Se não autenticado, a URL será criada sem associação.
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalUrl
 *             properties:
 *               originalUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: URL criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Url'
 *   get:
 *     tags: [URLs]
 *     summary: Lista todas as URLs do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Url'
 *       401:
 *         description: Não autorizado - Token ausente ou inválido
 *
 * @swagger
 * /urls/{id}:
 *   put:
 *     tags: [URLs]
 *     summary: Atualiza uma URL específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalUrl
 *             properties:
 *               originalUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: URL atualizada com sucesso
 *       401:
 *         description: Não autorizado - Token ausente ou inválido
 *       403:
 *         description: Proibido - URL pertence a outro usuário
 *       404:
 *         description: URL não encontrada
 *   delete:
 *     tags: [URLs]
 *     summary: Remove uma URL específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: URL removida com sucesso
 *       401:
 *         description: Não autorizado - Token ausente ou inválido
 *       403:
 *         description: Proibido - URL pertence a outro usuário
 *       404:
 *         description: URL não encontrada
 *
 * @swagger
 * /{shortCode}:
 *   get:
 *     tags: [URLs]
 *     summary: Redireciona para a URL original
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirecionamento para a URL original
 *       404:
 *         description: URL não encontrada
 */

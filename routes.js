const router = require ('express').Router();
const authController = require('./controllers/auth');
const plaidController = require('./controllers/plaid');

//auth routes
router.get('/', (req,res) => console.log('Test EndPoint'));
router.post('/register',authController.register);
router.post('/login', authController.login);
router.post('/verifytoken',authController.verifyToken);

//plaid routes
router.post('/verifystatus',plaidController.verifystatus);
router.post('/createlinktoken', plaidController.create_link_token);
router.post('/getaccesstoken', plaidController.get_access_token);
router.post('/fetchtransactions',plaidController.fetch_transactions);
router.post('/plaidtoexpenses',plaidController.plaidtoexpenses);

module.exports = router;
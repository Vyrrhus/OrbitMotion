const BODIES = {
	SUN: 			new Body('SUN', 'yellow', 1988500e24, 6.957e5),
	MERCURY: 		new Body('MERCURY', '#929292', 3.302e23, 2440),
	EARTH: 			new Body('EARTH', '#5880b8', 5.97219e24, 6371.009),
	MOON: 			new Body('MOON', '#D8D8D8', 7.349e22, 1737.53),
	VENUS: 			new Body('VENUS', '#dabeac', 48.685e23, 6051.893),
	MARS: 			new Body('MARS', '#d8b059', 6.4171e23, 3389.92),
	JUPITER: 		new Body('JUPITER', '#a98723', 1898.13e24, 69911),
	IO: 			new Body('IO', '#E8D76F', 8.933e22, 1821.3),
	SATURN: 		new Body('SATURN', '#f7e4c8', 5.6834e26, 58232),
	URANUS: 		new Body('URANUS', '#b0b2c8', 86.813e24, 25362),
	NEPTUNE: 		new Body('NEPTUNE', '#004e73', 102.413e24, 24624),
	PLUTO: 			new Body('PLUTO', '#d8d8d8', 1.307e22, 1188.3),
	ULTIMA_THULE: 	new Body('ULTIMA_THULE', '#d8d8d8', 6e17, 30)
};

const SATELLITES = {
	ISS: 			new Body('ISS', 'white', 419725, 0),
	GEO: 			new Body('GEO', 'white', 50, 0),
	POLAR: 			new Body('POLAR', 'white', 50, 0),
	MOLNIYA: 		new Body('MOLNIYA', 'white', 50, 0),
	EQUATOR: 		new Body('EQUATOR', 'white', 50, 0),
	ECLIPTIC: 		new Body('ECLIPTIC', 'white', 50, 0)
};

const KERBAL = {
	KERBOL: 		new Body('KERBOL', '#FFF087', 1.7565459e28, 261600),
	MOHO: 			new Body('MOHO', '#6C5748', 2.5263314e21, 250),
	EVE: 			new Body('EVE', '#473353', 1.2243980e23, 700),
	GILLY: 			new Body('GILLY', '#927F71', 1.2420363e17,13),
	KERBIN: 		new Body('KERBIN', '#2F3644', 5.2915158e22,600),
	MUN: 			new Body('MUN', '#565857', 9.7599066e20,200),
	MINMUS: 		new Body('MINMUS', '#A8E4CB', 2.6457580e19,60),
	DUNA: 			new Body('DUNA', '#7E381F', 4.5154270e21,320),
	IKE: 			new Body('IKE', '#504F50', 2.7821615e20,130),
	DRES: 			new Body('DRES', '#5A5555', 3.2190937e20,138),	
	JOOL: 			new Body('JOOL', '#3F7C0F', 4.2332127e24,6000),
	LAYTHE: 		new Body('LAYTHE', '#31323B', 2.9397311e22,500),
	VALL: 			new Body('VALL', '#4F5D62', 3.1087655e21,300),
	TYLO: 			new Body('TYLO', '#F6ECDD', 4.2332127e22,600),
	BOP: 			new Body('BOP', '#54483F', 3.7261090e19,65),
	POL: 			new Body('POL', '#ACA57C', 1.0813507e19,44),
	EELOO: 			new Body('EELOO', '#B5BCB1', 1.1149224e21,210)
};

const CONSTELLATION = {
	SAT1:			new Body('SAT1', 'white', 5000, 0),
	SAT2:			new Body('SAT2', 'white', 5000, 0),
	SAT3:			new Body('SAT3', 'white', 5000, 0),
	SAT4:			new Body('SAT4', 'white', 5000, 0),
	SAT5:			new Body('SAT5', 'white', 5000, 0),
	SAT6:			new Body('SAT6', 'white', 5000, 0),
	SAT7:			new Body('SAT7', 'white', 5000, 0),
	SAT8:			new Body('SAT8', 'white', 5000, 0),
	SAT9:			new Body('SAT9', 'white', 5000, 0),
	SAT10:			new Body('SAT10', 'white', 5000, 0),
	SAT11:			new Body('SAT11', 'white', 5000, 0),
	SAT12:			new Body('SAT12', 'white', 5000, 0),
	SAT13:			new Body('SAT13', 'white', 5000, 0),
	SAT14:			new Body('SAT14', 'white', 5000, 0),
	SAT15:			new Body('SAT15', 'white', 5000, 0),
	SAT16:			new Body('SAT16', 'white', 5000, 0),
	SAT17:			new Body('SAT17', 'white', 5000, 0),
	SAT18:			new Body('SAT18', 'white', 5000, 0),
	SAT19:			new Body('SAT19', 'white', 5000, 0),
	SAT20:			new Body('SAT20', 'white', 5000, 0),
	SAT21:			new Body('SAT21', 'white', 5000, 0),
	SAT22:			new Body('SAT22', 'white', 5000, 0),
	SAT23:			new Body('SAT23', 'white', 5000, 0),
	SAT24:			new Body('SAT24', 'white', 5000, 0),
	SAT25:			new Body('SAT25', 'white', 5000, 0),
	SAT26:			new Body('SAT26', 'white', 5000, 0),
	SAT27:			new Body('SAT27', 'white', 5000, 0),
	SAT28:			new Body('SAT28', 'white', 5000, 0),
	SAT29:			new Body('SAT29', 'white', 5000, 0),
	SAT30:			new Body('SAT30', 'white', 5000, 0),
};

const SATs = {
                _1: new Body('SAT 1', '#FF0000', 0, 0),
                _2: new Body('SAT 2', '#FF5500', 0, 0),
                _3: new Body('SOI TEST', '#55FF99', 0, 0),
                _4: new Body('CRASH TEST', '#5555FF', 0, 0),
                _5: new Body('SAT 5', '#FF9900', 0, 0),
                _6: new Body('SAT 6', '#FF0099', 0, 0)
             }

// Inclined SATS crossing MOON's orbit
const ENCOUNTER = {
    a: new Body('CIRCULAR INCLINED', '#00FF99', 0, 0)
}
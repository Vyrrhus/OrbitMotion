"""
	Using HORIZONS system from NASA JPL through telnet
	More informations about HORIZONS : https://ssd.jpl.nasa.gov/?horizons#telnet
	
	This script uses a module developped by The Astropy Project
	See: http://www.astropy.org/
"""

from astroquery.jplhorizons import Horizons

searching_body = '399'

try:
	rslt = Horizons(id=searching_body, id_type='majorbody')
except:
	rslt = Horizons(id=searching_body, id_type='smallbody')
	
print(rslt.elements()['Omega'])

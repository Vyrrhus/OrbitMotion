const HUD = {
	/*
		objet pour gérer tous les sous-objets du HUD, les différents events, etc.
	*/
	zoom: true,
	move: true,
	focus: true,
	lock: function() {
		this.zoom = false;
		this.move = false;
		this.focus = false;
	},
	unlock: function() {
		this.zoom = true;
		this.move = true;
		this.focus = true;
	}
}

/*
	HUD contiendra également les éléments graphiques d'un menu, c'est un gros module avec beaucoup d'évènements
*/
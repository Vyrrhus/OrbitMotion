// Quaternion
class quat {
	// Constructor
	constructor(w, x, y, z) {
		this.w = w;
		this.x = x;
		this.y = y;
		this.z = z;
	}
	// Properties
	get conj() {
		return new quat(this.w, - this.x, - this.y, - this.z)
	}
	get round() {
		function set_round(e) {
			return Math.round(e*1e10)/1e10
		}
		return new quat(set_round(this.w),
						set_round(this.x),
						set_round(this.y),
						set_round(this.z))
	}
	
	// Static methods
	static hamilton(u, v) {
		var H = new quat(u.w * v.w - u.x * v.x - u.y * v.y - u.z * v.z,
					    u.w * v.x + v.w * u.x + u.y * v.z - u.z * v.y,
					    u.w * v.y - u.x * v.z + u.y * v.w + u.z * v.x,
					    u.w * v.z + u.x * v.y - u.y * v.x + u.z * v.w);
		return H
	}
	static rotate(u, angle, axis) {
		angle = tool.deg_to_rad(angle)
		var R = new quat(Math.cos(angle/2),
						 Math.sin(angle/2) * axis.x,
						 Math.sin(angle/2) * axis.y,
						 Math.sin(angle/2) * axis.z);
		var R_conj = R.conj;
		var P = new quat(0, u.x, u.y, u.z);
		var P_rot = quat.hamilton(quat.hamilton(R, P),R_conj);
		P_rot = P_rot.round;
		return new vect3(P_rot.x, P_rot.y, P_rot.z);
	}
}
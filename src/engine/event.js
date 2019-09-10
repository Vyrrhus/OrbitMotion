class Event {
    // CONSTRUCTOR
    constructor(body) {
        // Properties
        this.body = body;
        this.event = null;
    }
    
    // GETTERS
    
    // METHODS
    check() {
        var TOF_list = [this.out_of_SOI(), this.crash(), this.encounter()]
        var TOF = null;
        for (let i = 0 ; i < TOF_list.length ; i++) {
            if (!TOF_list[i]) {
                continue
            }
            if (!TOF) {
                TOF = TOF_list[i]
            } else {
                TOF = Math.min(TOF, TOF_list[i])
            }
        }
        if (TOF !== null) {
            console.log(this.body.name, 'will encounter an event in', TOF, 's')
        }
        return TOF
    }
    
    // 1 - OUT OF PRIMARY's SOI
    out_of_SOI() {
        if (this.body.orbit.parent.SOI === undefined) {
            return null
        }
        
        // Anomaly at which SOI boundary is crossed
        var SOI = this.body.orbit.parent.SOI
        var SOI_anomaly = this.body.orbit.distance_to_v(SOI)
        if (!SOI_anomaly) {
            return null
        }
        
        // Delay before reaching anomaly
        var v  = this.body.orbit.v;
        if (v >= Math.PI) {
            var dv = 2 * Math.PI - v + SOI_anomaly;
        } else {
            var dv = SOI_anomaly - v;
        }
        var TOF = this.body.orbit.time_dv(this.body.orbit.distance, SOI, dv)
        console.log(this.body.name, ' will reach ', this.body.orbit.parent.name, " SOI's boundary in ", TOF, 's, on: ', new Date(TIME.date.getTime() + TOF*1000).str())
        return TOF
    }
    // 2 - CRASH ON PRIMARY
    crash() {
        if (this.body.orbit === null) {
            return null
        }
        
        // Anomaly at which crash occurs
        var radius = this.body.orbit.parent.radius
        var radius_anomaly = 2 * Math.PI - this.body.orbit.distance_to_v(radius);
        if (!radius_anomaly) {
            return null
        }
        
        // Delay before reaching anomaly
        var v = this.body.orbit.v;
        if (v > radius_anomaly) {
            // Already crashed
            return 0
        } else {
            var dv = radius_anomaly - v;
        }
        var TOF = this.body.orbit.time_dv(this.body.orbit.distance, radius, dv)
        console.log(this.body.name, 'will crash on', this.body.orbit.parent.name, "in", TOF, 's, on:', new Date(TIME.date.getTime() + TOF*1000).str())
        return TOF
    }
    // 3 - ENCOUNTER WITH ANOTHER CHILD
    encounter() {
        if (this.body.orbit === null) {
            return null
        }
        var child = this.body.orbit.parent.child
        var self  = this.body
        child.sort(function(a,b) {
            return (b.mass - a.mass)
        });
        for (let i = 0 ; i < child.length ; i++) {
            if (child[i] === this.body || !child[i].SOI) {
                break
            }
            var orbit_p = child[i].orbit
            var orbit_s = this.body.orbit
            
            // Apoapsis-Periapsis filter
            if (orbit_s.shape === 'ellipse' && orbit_p.shape === 'ellipse') {
                var apo_min = Math.min(orbit_s.ap, orbit_p.ap)
                var per_max = Math.max(orbit_s.pe, orbit_p.pe)
                if (per_max - apo_min > child[i].SOI) {
                    continue
                }
            }
            
            // Geometrical filter
            // Node line vector (non-coplanar method)
            var w_p = orbit_p.vect_normal
            var w_s = orbit_s.vect_normal
            var k_node = vect3.cross(w_p, w_s)
            
            var i_r = Math.asin(k_node.module)
            
            // Non-coplanar method
            if (i_r >= 1e-3) {
                // Angles between line of ascending node and k_node
                var cos_dp = (Math.sin(orbit_p.i) * Math.cos(orbit_s.i) - Math.sin(orbit_s.i) * Math.cos(orbit_p.i) * Math.cos(orbit_p.W - orbit_s.W)) / Math.sin(i_r)
                var sin_dp = (Math.sin(orbit_s.i) * Math.sin(orbit_p.W - orbit_s.W)) / Math.sin(i_r)
                var dp = tool.quadrant(cos_dp,sin_dp)
            
                var cos_ds = (Math.sin(orbit_p.i) * Math.cos(orbit_s.i) * Math.cos(orbit_p.W - orbit_s.W) - Math.sin(orbit_s.i) * Math.cos(orbit_p.i)) / Math.sin(i_r)
                var sin_ds = (Math.sin(orbit_p.i) * Math.sin(orbit_p.W - orbit_s.W)) / Math.sin(i_r)
                var ds = tool.quadrant(cos_ds,sin_ds)
            
                // Angles between k_node and true anomaly
                function u_p(v_p) {
                    return v_p + orbit_p.w - dp
                }
                function u_s(v_s) {
                    return v_s + orbit_s.w - ds
                }
                
                // Angle between position vectors
                function cos_g(v_p, v_s) {
                    return Math.cos(u_p(v_p)) * Math.cos(u_s(v_s)) + Math.sin(u_p(v_p)) * Math.sin(u_s(v_s)) * Math.cos(i_r)
                }
                
                // Other notations
                var ax_s = orbit_s.e * Math.cos(orbit_s.w - ds)
                var ax_p = orbit_p.e * Math.cos(orbit_p.w - ds)
                var ay_s = orbit_s.e * Math.sin(orbit_s.w - ds)
                var ay_p = orbit_p.e * Math.sin(orbit_p.w - ds)
                function A(v_p) { return Math.sin(u_p(v_p)) + ay_p}
                function B(v_p) { return Math.cos(u_p(v_p)) + ax_p}
                function C(v_s) { return Math.sin(u_s(v_s)) + ay_s}
                function D(v_s) { return Math.cos(u_s(v_s)) + ax_s}
                
                // Functions and their derivatives
                function F(v_p,v_s) {
                    return orbit_p.v_to_distance(v_p) * orbit_p.e * Math.sin(v_p) + orbit_s.v_to_distance(v_s) * (A(v_p) * Math.cos(u_s(v_s)) - B(v_p) * Math.cos(i_r) * Math.sin(u_s(v_s)))
                }
                function G(v_p,v_s) {
                    return orbit_s.v_to_distance(v_s) * orbit_s.e * Math.sin(v_s) + orbit_p.v_to_distance(v_p) * (C(v_s) * Math.cos(u_p(v_p)) - D(v_s) * Math.cos(i_r) * Math.sin(u_p(v_p)))
                }
                function dFp(v_p,v_s) {
                    return orbit_p.v_to_distance(v_p) * orbit_p.e * Math.cos(orbit_p.anomaly) + orbit_s.v_to_distance(v_s) * cos_g(v_p,v_s)
                }
                function dFs(v_p,v_s) {
                    return - orbit_s.v_to_distance(v_s) / (1 + orbit_s.e * Math.cos(v_s)) * (A(v_p)*C(v_s) + B(v_p)*D(v_s) * Math.cos(i_r))
                }
                function dGp(v_p,v_s) {
                    return - orbit_p.v_to_distance(v_p) / (1 + orbit_p.e * Math.cos(v_p)) * (A(v_p)*C(v_s) + B(v_p)*D(v_s) * Math.cos(i_r))
                }
                function dGs(v_p,v_s) {
                    return orbit_s.v_to_distance(v_s) * orbit_s.e * Math.cos(orbit_s.anomaly) + orbit_p.v_to_distance(v_p) * cos_g(v_p,v_s)
                }
                
                function dv_p(v_p, v_s) {
                    return (F(v_p,v_s) * dGs(v_p,v_s) - G(v_p,v_s) * dFs(v_p,v_s)) / (dFs(v_p,v_s) * dGp(v_p,v_s) - dFp(v_p,v_s) * dGs(v_p,v_s))
                }
                function dv_s(v_p, v_s) {
                    return (G(v_p,v_s) * dFp(v_p,v_s) - F(v_p,v_s) * dGp(v_p,v_s)) / (dFs(v_p,v_s) * dGp(v_p,v_s) - dFp(v_p,v_s) * dGs(v_p,v_s))
                }
                
                // Newton scheme
                function newton(v0p, v0s) {
                    let step = 0
                    let vi_p = v0p
                    let vj_p = vi_p
                    let vi_s = v0s
                    let vj_s = vi_s
                    do {
//                        console.log('p:', tool.rad_to_deg(vj_p).toFixed(5), '- s:', tool.rad_to_deg(vj_s).toFixed(5))
                        step++
                        vi_p = vj_p % (Math.PI * 2)
                        vi_s = vj_s % (Math.PI * 2)
                        vj_p = vi_p + dv_p(vi_p, vi_s)
                        vj_s = vi_s + dv_s(vi_p, vi_s)
//                        console.log('dv:', dv_p(vi_p, vi_s).toFixed(6), dv_s(vi_p, vi_s).toFixed(6))
                    } while (Math.abs((vj_p-vi_p)/vi_p) > 1e-5 && Math.abs((vj_s-vi_s)/vi_s) > 1e-5 && step < 50)
                    if (vj_p < 0) {
                        vj_p += Math.PI * 2
                    }
                    if (vj_s < 0) {
                        vj_s += Math.PI * 2
                    }
                    if (step < 50) {
                        console.log('Node for', child[i].name, '(', tool.rad_to_deg(vj_p),') &', self.name, '(', tool.rad_to_deg(vj_s), ')')
                        console.log('rsl:', tool.rad_to_deg(vj_p),tool.rad_to_deg(vj_s))
                        console.log(step, 'steps for solving Newton')
                        return {p: vj_p, s: vj_s}
                    } else {
                        console.log('Node for', child[i].name, '(', tool.rad_to_deg(vj_p),') &', self.name, '(', tool.rad_to_deg(vj_s), ')')
                        console.log('rsl:', tool.rad_to_deg(vj_p),tool.rad_to_deg(vj_s))
                        console.log(step, 'steps for solving Newton')
//                        return {p: vj_p, s: vj_s}
                        return {p: null, s: null}
                    }
                }
                function relative_distance(vp,vs) {
                    var relative_distance = Math.sqrt(Math.square(orbit_p.v_to_distance(vp)) + Math.square(orbit_s.v_to_distance(vs)) - 2 * orbit_p.v_to_distance(vp)*orbit_s.v_to_distance(vs)*cos_g(vp,vs))
                    console.log('with:', tool.rad_to_deg(vp),tool.rad_to_deg(vs))
                    console.log('Min distance:', relative_distance, ' | ', child[i].SOI)
                    return relative_distance
                }
                
                // TEST 2
                var cases = []
                for (let k = 0 ; k < Math.PI * 2 ; k += Math.PI/180) {
                    console.log('___')
                    console.log('ini:', tool.rad_to_deg(dp - orbit_p.w + k), tool.rad_to_deg(ds - orbit_s.w + k))
                    var result = newton(dp - orbit_p.w + k, ds - orbit_s.w + k)
                    if (result.p === null || result.s === null) {
                        continue
                    }
                    var uniqueness = true
                    for (let m = 0 ; m < cases.length ; m++) {
                        if (Math.abs(cases[m].p - result.p) < 1e-3 && Math.abs(cases[m].s - result.s) < 1e-3) {uniqueness = false}
                    }
                    if (uniqueness) {cases.push(result)}
                }
                var encounters = []
                for (let k = 0 ; k < cases.length ; k++) {
                    if (relative_distance(cases[k].p, cases[k].s) < child[i].SOI) {encounters.push(cases[k])}
                }
                if (!encounters) {continue}
                else {
                    for (let k = 0 ; k < encounters.length ; k++) {
                        console.log('RDV possible for', child[i].name, '(', tool.rad_to_deg(encounters[k].p),') &', this.body.name, '(', tool.rad_to_deg(encounters[k].s), ')')
                    }
                }
                this.body.sketch.show.anomaly = true;
                child[i].sketch.show.anomaly = true;
                
                // TEST 1
//                var case_1 = newton(dp - orbit_p.w, ds - orbit_s.w)
//                var case_2 = newton(case_1.p + Math.PI, case_1.s + Math.PI)
//                var self = this.body
//                
//                // Select cases of possible rendez-vous
//                var encounters = []
//                if (relative_distance(case_1.p, case_1.s) < child[i].SOI) {encounters.push(case_1)}
//                if (relative_distance(case_2.p, case_2.s) < child[i].SOI) {encounters.push(case_2)}
//                if (!encounters) {
//                    continue
//                } else {
//                    for (let i = 0 ; i < encounters.length ; i++) {
//                        console.log('RDV possible for', child[i].name, '(', tool.rad_to_deg(encounters[i].p),') &', this.body.name, '(', tool.rad_to_deg(encounters[i].s), ')')
//                    }
//                }
//                this.body.sketch.show.anomaly = true;
//                child[i].sketch.show.anomaly = true;
                
            }
            
            // Coplanar method 
        }
    }
    
    
    // Static methods
}
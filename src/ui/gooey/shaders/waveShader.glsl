uniform sampler2D u_map;
uniform sampler2D u_hovermap;

uniform float u_alpha;
uniform float u_time;
uniform float u_progressHover;
uniform float u_progressClick;

uniform vec2 u_res;
uniform vec2 u_mouse;
uniform vec2 u_ratio;
uniform vec2 u_hoverratio;

varying vec2 v_uv;

void main() {
  vec2 resolution = u_res * PR;
  float time = u_time * 0.05;
  float progress = u_progressClick;
  float progressHover = u_progressHover;
  vec2 uv = v_uv;
  vec2 uv_h = v_uv;

  vec2 st = gl_FragCoord.xy / resolution.xy - vec2(0.5);
  st.y *= resolution.y / resolution.x;

  vec2 mouse = vec2((u_mouse.x / u_res.x) * 2. - 1., -(u_mouse.y / u_res.y) * 2. + 1.) * -0.5;
  mouse.y *= resolution.y / resolution.x;

  float offX = uv.x * 0.3 - time * 0.3;
  float offY = uv.y + sin(uv.x * 5.) * 0.1 - sin(time * 0.5) + snoise3(vec3(uv.x, uv.y, time) * 0.5);
  offX += snoise3(vec3(offX, offY, time) * 5.) * 0.3;
  offY += snoise3(vec3(offX, offX, time * 0.3)) * 0.1;
  float nc = (snoise3(vec3(offX, offY, time * 0.5) * 8.)) * progressHover;
  float nh = (snoise3(vec3(offX, offY, time * 0.5) * 2.)) * 0.03;
  nh *= smoothstep(nh, 0.5, 0.6);

  uv_h -= vec2(0.5);
  uv_h *= u_hoverratio;
  uv_h += vec2(0.5);

  uv -= vec2(0.5);
  uv *= u_ratio;
  uv += vec2(0.5);

  vec4 image = texture2D(u_map, uv_h + vec2(nc + nh) * progressHover);
  vec4 hover = texture2D(u_hovermap, uv + vec2(nc + nh) * progressHover * (1. - progress));
  vec4 finalImage = mix(image, hover, clamp(nh * (1. - progress) + progressHover, 0., 1.));

  gl_FragColor = vec4(finalImage.rgb, u_alpha);
}

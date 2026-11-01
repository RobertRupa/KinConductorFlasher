"use strict";
const i18n=window.KinI18n;
const profiles=["kc868-a6-coprocessor","kc868-a6","kc868-a6-base","kc868-a4","kc868-a8","kc868-a8s","kc868-a16","kc868-a32","kc868-a64","kc868-a128"];
const $=id=>document.getElementById(id), profile=$("profile"), version=$("version"), installer=$("installer"), start=$("start");
profiles.forEach(p=>{profile.add(new Option(p,p));$("build-profile").add(new Option(p,p));});const params=new URLSearchParams(location.search);if(profiles.includes(params.get("profile")))profile.value=params.get("profile");$("build-profile").value=profile.value;
let catalog;
function refresh(){const release=catalog?.releases.find(r=>r.tag===version.value),entry=release?.profiles[profile.value];$("alias").hidden=!(!["kc868-a6","kc868-a6-coprocessor","kc868-a6-base"].includes(profile.value));installer.removeAttribute("manifest");start.disabled=true;
if(!entry){$("info").textContent=i18n.t("unavailable");return}
$("info").textContent=`${release.tag} · ${profile.value} · app ${(entry.firmwareBytes/1024).toFixed(1)} KiB · ${i18n.t("remaining")} ${(entry.otaRemainingBytes/1024).toFixed(1)} KiB · commit ${entry.commit.slice(0,10)}`;
$("download").href="https://github.com/RobertRupa/KinConductor/releases/tag/"+encodeURIComponent(release.tag);
installer.setAttribute("manifest",new URL(entry.manifest,location.href).href);start.disabled=!$("confirm").checked||!("serial" in navigator)}
[profile,version,$("confirm")].forEach(e=>e.addEventListener("change",refresh));
fetch("./catalog.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(c=>{catalog=c;c.releases.forEach((r,i)=>version.add(new Option(r.tag+(i===0?` (${i18n.t("latest")})`:""),r.tag)));if(c.releases[0])$("build-ref").value=c.releases[0].tag;if(c.releases.some(r=>r.tag===params.get("version")))version.value=params.get("version");refresh()}).catch(e=>{$("info").textContent=i18n.t("fetchError")+e.message});
i18n.onChange(()=>{ if(catalog){Array.from(version.options).forEach((opt,i)=>{opt.textContent=opt.value+(i===0?` (${i18n.t("latest")})`:"")});refresh();}else if(!version.options.length){$("info").textContent=i18n.t("loading");}});

const validRef=value=>/^[A-Za-z0-9][A-Za-z0-9._/-]{0,79}$/.test(value)&&!value.includes("..")&&!value.endsWith("/")&&!value.startsWith("-");
const validFlags=value=>value.length<=512&&value.trim().split(/\s+/).filter(Boolean).every(token=>/^-D[A-Za-z_][A-Za-z0-9_]*(?:=[A-Za-z0-9_.+-]{1,60})?$/.test(token));
$("copy-command").addEventListener("click",async()=>{
 const ref=$("build-ref").value.trim(),selected=$("build-profile").value,defines=$("build-defines").value.trim(),feedback=$("build-feedback");
 if(!validRef(ref)||!profiles.includes(selected)||!validFlags(defines)){feedback.textContent=i18n.t("invalidBuild");return;}
 const quote=value=>"'"+value.replaceAll("'","'\\''")+"'";
 const cmd="gh workflow run custom-build.yml --repo RobertRupa/KinConductorFlasher --ref main -f source_ref="+quote(ref)+" -f profile="+quote(selected)+" -f custom_defines="+quote(defines);
 try{await navigator.clipboard.writeText(cmd);feedback.textContent=i18n.t("copied");}catch(_){feedback.textContent=cmd;}
});

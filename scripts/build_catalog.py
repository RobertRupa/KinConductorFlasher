#!/usr/bin/env python3
"""Stage verified upstream GitHub Release binaries for ESP Web Tools/GitHub Pages."""
import hashlib,io,json,pathlib,re,shutil,tarfile,urllib.request
ROOT=pathlib.Path(__file__).resolve().parent.parent
SITE=ROOT/"site"
PROFILES=("kc868-a6-base","kc868-a6","kc868-a4","kc868-a8","kc868-a8s","kc868-a16","kc868-a32","kc868-a64","kc868-a128","kc868-a6-coprocessor")
LIMIT=12*1024*1024
def fetch(url):
    request=urllib.request.Request(url,headers={"User-Agent":"KinConductorFlasher/1.0","Accept":"application/vnd.github+json"})
    with urllib.request.urlopen(request,timeout=50) as response: data=response.read(LIMIT+1)
    if len(data)>LIMIT: raise ValueError("Asset too large")
    return data
def main():
    SITE.mkdir(exist_ok=True)
    for f in ("index.html","app.js","i18n.js","style.css"): shutil.copyfile(ROOT/f,SITE/f)
    releases=json.loads(fetch("https://api.github.com/repos/RobertRupa/KinConductor/releases"))
    catalog={"releases":[]}
    for release in releases:
        tag=release.get("tag_name","")
        if release.get("draft") or release.get("prerelease") or not re.fullmatch(r"v\d+\.\d+\.\d+",tag):continue
        assets={a["name"]:a for a in release.get("assets",[])}
        if any(f"KinConductor-{tag}-{profile}.tar.gz" not in assets for profile in PROFILES):continue
        record={"tag":tag,"profiles":{}}
        for profile in PROFILES:
            archive=fetch(assets[f"KinConductor-{tag}-{profile}.tar.gz"]["browser_download_url"])
            with tarfile.open(fileobj=io.BytesIO(archive),mode="r:gz") as bundle:
                members={m.name:m for m in bundle if m.isfile()}
                def read(name):
                    member=members.get(profile+"/"+name)
                    if member is None or member.size>5*1024*1024:raise ValueError(f"Invalid archive member {tag}/{profile}/{name}")
                    return bundle.extractfile(member).read()
                meta=json.loads(read("manifest.json"))
                if meta.get("project")!="KinConductor" or meta.get("tag")!=tag or meta.get("profile")!=profile or meta.get("flashBytes")!=4194304 or not re.fullmatch("[0-9a-f]{40}",meta.get("commit","")):raise ValueError("Invalid metadata")
                files={item["name"]:item for item in meta["files"]}
                out=SITE/"firmware"/tag/profile
                out.mkdir(parents=True,exist_ok=True)
                parts=[]
                for name,offset in (("firmware.factory.bin",0),("littlefs.bin",0x310000)):
                    item=files[name];binary=read(name)
                    if item["offset"]!=offset or item["bytes"]!=len(binary) or hashlib.sha256(binary).hexdigest()!=item["sha256"] or offset+len(binary)>4194304:raise ValueError("Invalid image offset/hash/size")
                    (out/name).write_bytes(binary)
                    parts.append({"path":"./"+name,"offset":offset})
                (out/"manifest.json").write_text(json.dumps({"name":f"KinConductor {tag} {profile} (factory)","version":tag,"chipFamily":"ESP32","parts":parts},indent=2)+"\n")
                record["profiles"][profile]={"manifest":f"./firmware/{tag}/{profile}/manifest.json","firmwareBytes":meta["firmwareBytes"],"otaRemainingBytes":meta["otaRemainingBytes"],"commit":meta["commit"]}
        catalog["releases"].append(record)
        break
    if not catalog["releases"]:raise RuntimeError("No complete stable KinConductor release")
    (SITE/"catalog.json").write_text(json.dumps(catalog,indent=2)+"\n")
    (SITE/".nojekyll").touch()
    print("Verified and staged",catalog["releases"][0]["tag"],len(PROFILES),"profiles")
if __name__=="__main__":main()

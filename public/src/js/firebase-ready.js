(function () {
    window.FirebaseReady = new Promise((resolve, reject) => {
        let tries = 0;
        function check() {
            tries++;
            try {
                if (firebase?.apps?.length > 0) {
                    resolve(firebase);
                    return;
                }
            } catch {}
            if (tries > 50) return reject("Firebase not ready");
            setTimeout(check, 200);
        }
        check();
    });
})();

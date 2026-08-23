import { getFirestore, doc, collection, addDoc, setDoc, getDoc, deleteDoc, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

export const firestore = {
    //*******************************************************
    //* Firestore Control functions
    //*******************************************************

    /**
     * Initialize Firestore
     * @param {Object} firebaseApp
     * @returns {Promise} resolve() - Success | reject(error) - Fail
     */
    init(firebaseApp) {
        return new Promise(async (resolve, reject) => {
            try {
                // Initialize Cloud Firestore and get a reference to the service
                this.firestore = await getFirestore(firebaseApp);

                resolve();
            } catch(error) {
                reject(error);
            }
        });
    },

    /**
     * Add new document without id
     * @param {string} collectionName
     * @param {Object} data
     * @returns {Promise} resolve(docRef) - Success | reject(error) - Fail
     */    
    add(collectionName, data) {
        return new Promise(async (resolve, reject) => {
            try {
                let docRef = await addDoc(collection(this.firestore, collectionName), data);
                resolve({id: docRef.id, data: data});
            } catch(error) {
                reject(error);
            }        
        });
    },

    /**
     * set or add document with id
     * @param {string} collectionName
     * @param {string} id
     * @param {Object} data
     * @returns {Promise} resolve() - Success | reject(error) - Fail
     */    
    set(collectionName, id, data) {
        return new Promise(async (resolve, reject) => {
            try {
                await setDoc(doc(this.firestore, collectionName, id), data);
                resolve({id: id, data: data});
            } catch(error) {
                reject(error);
            }        
        });
    },

    /**
     * Delete document
     * @param {string} collectionName
     * @param {string} id
     * @returns {Promise} resolve() - Success | reject(error) - Fail
     */
    del(collectionName, id) {
        return new Promise(async (resolve, reject) => {
            try {
                await deleteDoc(doc(this.firestore, collectionName, id));
                resolve();
            } catch(error) {
                reject(error);
            }
        });
    },

    /**
     * Get saved document
     * @param {string} collectionName
     * @param {string} id
     * @returns {Promise} resolve({id,data} docRef) - Success | reject(error) - Fail
     */    
    get(collectionName, id) {
        return new Promise(async (resolve, reject) => {
            try {
                let docSnap = await getDoc(doc(this.firestore, collectionName, id));
                if(docSnap.exists()) {
                    let docRef = {};
                    docRef.id = docSnap.id;
                    docRef.data = docSnap.data();
                    resolve(docRef);
                } else {
                    reject({code:-1, message:"Firebase: No such document."});
                }
            } catch(error) {
                reject(error);
            }        
        });
    },

    /**
     * Verif if a document exists by id
     * @param {string} collectionName
     * @param {string} id
     * @returns {Promise} resolve(true) - Exists | resolve(false) - Doesn't exists
     */    
    exists(collectionName, id) {
        return new Promise(async (resolve) => {
            try {
                let docSnap = await getDoc(doc(this.firestore, collectionName, id));
                if(docSnap.exists()) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch(error) {
                resolve(false);
            }        
        });
    },

    /**
     * Get a document field by id
     * @param {string} collectionName
     * @param {string} id
     * @param {string} field
     * @returns {Promise} resolve(field) - Success | resolve(null) - Fail
     */    
    getField(collectionName, id, field) {
        return new Promise(async (resolve) => {
            try {
                let docSnap = await getDoc(doc(this.firestore, collectionName, id));
                if(docSnap.exists()) {
                    let data = docSnap.data();
                    resolve(data[field]);
                } else {
                    resolve(null);
                }
            } catch(error) {
                resolve(null);
            }        
        });
    },

    /**
     * Load collection
     * @param {string} collectionName
     * @param {Object} condition (optional) { field: {String}, operator: {String}, value: {Object} }
     * @returns {Promise} resolve(array{id,data}) - Success | reject(error) - Fail
     */
    loadCollection(collectionName, condition1, condition2, condition3, condition4) {
        return new Promise(async (resolve, reject) => {
            let list = {};
            try {
                let q;
                if(condition1 === undefined) {
                    q = query(collection(this.firestore, collectionName));
                } else {
                    if(condition2 === undefined) {
                        q = query(collection(this.firestore, collectionName), where(condition1.field, condition1.operator, condition1.value));
                    } else {
                        if(condition3 === undefined) {
                            q = query(collection(this.firestore, collectionName), where(condition1.field, condition1.operator, condition1.value), where(condition2.field, condition2.operator, condition2.value));
                        } else {
                            if(condition4 === undefined) {
                                q = query(collection(this.firestore, collectionName), where(condition1.field, condition1.operator, condition1.value), where(condition2.field, condition2.operator, condition2.value), where(condition3.field, condition3.operator, condition3.value));
                            } else {
                                q = query(collection(this.firestore, collectionName), where(condition1.field, condition1.operator, condition1.value), where(condition2.field, condition2.operator, condition2.value), where(condition3.field, condition3.operator, condition3.value), where(condition4.field, condition4.operator, condition4.value));
                            }
                        }
                    }
                }
                
                let querySnapshot = await getDocs(q);
                querySnapshot.forEach((docSnap) => {
                    list[docSnap.id] = docSnap.data();
                });
                resolve(list);
            } catch(error) {
                reject(error);
            }        
        });
    }
    
};

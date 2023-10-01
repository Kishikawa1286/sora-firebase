export const deleteAllSubcollections = async (
  docRef: FirebaseFirestore.DocumentReference
) => {
  const collections = await docRef.listCollections();
  const deletePromises = collections.map(async (collection) => {
    const docs = await collection.listDocuments();
    const docDeletePromises = docs.map(async (doc) => {
      await deleteAllSubcollections(doc); // Recurse into subcollections
      return doc.delete();
    });
    return Promise.all(docDeletePromises);
  });
  await Promise.all(deletePromises);
};

function getPaginationParams(req) {
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (isNaN(page) || page < 1) {
        page = 1;
    }

    if (isNaN(limit) || limit < 1) {
        limit = 20;
    }

    if (limit > 100) {
        limit = 100;
    }

    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

async function executePaginatedQuery(queryRef, req) {
    const { page, limit, offset } = getPaginationParams(req);

    // Fetch limit + 1 items to accurately check if there is a next page
    const snapshot = await queryRef.offset(offset).limit(limit + 1).get();
    
    const items = [];
    snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
    });

    const hasNextPage = items.length > limit;
    if (hasNextPage) {
        items.pop();
    }

    return {
        data: items,
        pagination: {
            page,
            limit,
            hasNextPage
        }
    };
}

module.exports = {
    getPaginationParams,
    executePaginatedQuery
};

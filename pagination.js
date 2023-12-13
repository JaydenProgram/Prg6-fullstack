function currentItems(total, start, limit) {
    if (!limit || !start) {
        return total;
    }
    return Math.min(total - start, limit);
}

function totalPages(total, start, limit) {
    if (!limit || !start) {
        return 1;
    }
    return Math.ceil(total / limit);
}

function currentPage(start, limit) {
    if (!limit || !start) {
        return 1;
    }
    return Math.floor(start / limit) + 1;
}

function firstItem() {
    return 1;
}

function lastItem(total, start, limit) {
    if (!limit || !start) {
        return total;
    }
    if (limit === 1) {
        return total;
    }
    return (totalPages(total, start, limit) - 1) * limit;
}


function nextItem(total, start, limit) {
    if (!limit || !start) {
        return null;
    }
    return Math.min(start + limit, lastItem(total, start, limit));
}

function previousPageItem(start, limit) {
    if (!limit || !start) {
        return null;
    }
    return Math.max(start - limit, firstItem());
}


function firstQuery(total, start, limit) {
    let queryString = "";
    if (limit && start) {
        queryString = `?start=${firstItem(total, start, limit)}&limit=${limit}`;
    }
    return queryString;
}

function lastQuery(total, start, limit) {
    let queryString = "";
    if (limit && start) {
        queryString = `?start=${lastItem(total, start, limit)}&limit=${limit}`;
    }
    return queryString;
}


function nextQuery(total, start, limit) {
    let queryString = "";
    let nextStart = nextItem(total, start, limit);
    if (limit && start) {
        if (nextStart !== null) {
            queryString = `?start=${nextStart}&limit=${limit}`;
        }
    }
    return queryString;
}

function previousQuery(start, limit) {
    let queryString = "";
    let previousStart = previousPageItem(start, limit);
    if (limit && start) {
        if (previousStart !== null) {
            queryString = `?start=${previousStart}&limit=${limit}`;
        }
    }
    return queryString;
}


function createPagination(total, start, limit) {
    let pagination = {
        currentPage: currentPage(start, limit),
        numberOfPages: totalPages(total, start, limit),
        currentItems: currentItems(total, start, limit),
        firstString: firstQuery(total, start, limit),
        lastString: lastQuery(total, start, limit),
        previousString: previousQuery(start, limit),
        nextString: nextQuery(total, start, limit),
    };
    return pagination
}

export default createPagination;
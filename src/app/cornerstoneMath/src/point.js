var cornerstoneMath = (function (cornerstoneMath) {

    "use strict";

    if(cornerstoneMath === undefined) {
        cornerstoneMath = {};
    }

    function pageToPoint(e)
    {
        return {
            x : e.pageX,
            y : e.pageY
        };
    }

    function subtract(lhs, rhs)
    {
        return {
            x : lhs.x - rhs.x,
            y : lhs.y - rhs.y
        };
    }

    function copy(point)
    {
        return {
            x : point.x,
            y : point.y
        };
    }

    function distance(from, to)
    {
        return Math.sqrt(distanceSquared(from, to));
    }

    function distanceSquared(from, to)
    {
        var delta = subtract(from, to);
        return delta.x * delta.x + delta.y * delta.y;
    }

    function insideRect(point, rect)
    {
        if( point.x < rect.left ||
            point.x > rect.left + rect.width ||
            point.y < rect.top ||
            point.y > rect.top + rect.height)
        {
            return false;
        }
        return true;
    }

    /**
     * Returns the closest source point to a target point
     * given an array of source points.
     *
     * @param sources An Array of source Points
     * @param target The target Point
     * @returns Point The closest point from the points array
     */
    function findClosestPoint(sources, target) {
        var distances = [];
        var minDistance;
        sources.forEach(function(source, index) {
            var distance = cornerstoneMath.point.distance(source, target);
            distances.push(distance);
            
            if (index === 0) {
                minDistance = distance;
            } else {
                minDistance = Math.min(distance, minDistance);
            }
        });

        var index = distances.indexOf(minDistance);
        return sources[index];
    }

    // module exports
    cornerstoneMath.point =
    {
        subtract : subtract,
        copy: copy,
        pageToPoint: pageToPoint,
        distance: distance,
        distanceSquared: distanceSquared,
        insideRect: insideRect,
        findClosestPoint: findClosestPoint
    };


    return cornerstoneMath;
}(cornerstoneMath));
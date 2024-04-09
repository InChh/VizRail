#include <catch2/catch_test_macros.hpp>
#include <catch2/catch_approx.hpp>
#include "Coordinate.h"
#include "Curve.h"

using namespace VizRailCore;
using namespace Catch;

TEST_CASE("TestCurveCreation", "[Curve]")
{
	const Point2D jd1 = {0.0, 0.0};
	const Point2D jd2 = {100.0, 100.0};
	const Point2D jd3 = {0.0, 200.0};
	const Point2D jd4 = {0.0, 0.0};
	const Point2D jd5 = {100.0, 0.0};
	const Point2D jd6 = {200.0, 0.0};
	const Point2D jd7 = {0.0, 0.0};
	const Point2D jd8 = {0.0, 100.0};
	const Point2D jd9 = {0.0, 200.0};

	const Curve curve(jd1, jd2, jd3, 1.0, 1.0);
	const Curve curve2(jd4, jd5, jd6, 1.0, 1.0);
	const Curve curve3(jd7, jd8, jd9, 1.0, 1.0);
	const Curve curve4(jd1, jd5, jd2, 1.0, 1.0);

	SECTION("TestCurveSteeringAngle")
	{
		REQUIRE(curve.SteeringAngle().Degree() == Approx(90.0));
		REQUIRE(curve2.SteeringAngle().Degree() == Approx(0.0));
		REQUIRE(curve3.SteeringAngle().Degree() == Approx(0.0));
		REQUIRE(curve4.SteeringAngle().Degree() == Approx(90.0));
	}
}

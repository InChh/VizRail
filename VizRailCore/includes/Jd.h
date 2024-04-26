#pragma once


struct Jd
{
	unsigned JdH;
	double N;
	double E;
	double Angle;
	double R;
	double Ls;
	double TH;
	double LH;
	double LJzx;
	double StartMileage;
	double EndMileage;

	static double Distance(const Jd& jd1, const Jd& jd2);
};

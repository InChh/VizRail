#include "stdafx.h"
#include "HorizontalAlignmentEntity.h"

#include <format>

#include "../VizRailCore/includes/Curve.h"
#include "../VizRailCore/includes/Exceptions.h"
#include "../VizRailCore/includes/IntermediateLine.h"


ACRX_DXF_DEFINE_MEMBERS(HorizontalAlignmentEntity, AcDbEntity,
                        AcDb::kDHL_CURRENT, AcDb::kMReleaseCurrent, 0, HORIZONTAL, /*MSG0*/"AutoCAD")

HorizontalAlignmentEntity::HorizontalAlignmentEntity(const AcString& name, const std::vector<Jd>& jds)
{
	_name = name;
	_horizontalAlignment.AddJd(jds);
}

Acad::ErrorStatus HorizontalAlignmentEntity::dwgInFields(AcDbDwgFiler* filer)
{
	assertWriteEnabled();
	if (const Acad::ErrorStatus es = AcDbEntity::dwgInFields(filer); es != Acad::eOk)
	{
		return es;
	}

	if (filer->filerType() == AcDb::kWblockCloneFiler)
	{
		AcDbHardPointerId id;
		filer->readHardPointerId(&id);
	}

	filer->readItem(_name);
	int size = 0;
	filer->readItem(&size);
	std::vector<Jd> jds(size);
	filer->readItem(jds.data(), size * sizeof(Jd));
	_horizontalAlignment.AddJd(jds);

	return filer->filerStatus();
}

Acad::ErrorStatus HorizontalAlignmentEntity::dwgOutFields(AcDbDwgFiler* filer) const
{
	assertReadEnabled();
	if (const Acad::ErrorStatus es = AcDbEntity::dwgOutFields(filer); es != Acad::eOk)
	{
		return es;
	}
	if (filer->filerType() == AcDb::kWblockCloneFiler)
	{
		filer->writeHardPointerId(ownerId());
	}

	filer->writeItem(_name);
	const std::vector<Jd> jds = _horizontalAlignment.GetJds();
	filer->writeItem(static_cast<int>(jds.size()));
	filer->writeItem(jds.data(), jds.size() * sizeof(Jd));

	return filer->filerStatus();
}

Acad::ErrorStatus HorizontalAlignmentEntity::dxfInFields(AcDbDxfFiler* filer)
{
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::dxfOutFields(AcDbDxfFiler* filer) const
{
	return Acad::eOk;
}


Adesk::Boolean HorizontalAlignmentEntity::subWorldDraw(AcGiWorldDraw* pWorldDraw)
{
	try
	{
		const auto xys = _horizontalAlignment.GetXys();
		bool ret = false;

		const AcGeVector3d normal(0, 0, 1);
		for (const auto& [xyName,xy] : xys)
		{
			if (xyName.find(L"夹直线") != -1)
			{
				const auto jzx = std::dynamic_pointer_cast<VizRailCore::IntermediateLine>(xy);
				ret = DrawIntermediateLine(pWorldDraw, jzx);
			}
			else if (xyName.find(L"曲线") != -1)
			{
				const auto qx = std::dynamic_pointer_cast<VizRailCore::Curve>(xy);
				ret = DrawCurve(pWorldDraw, qx);
			}
		}

		pWorldDraw->subEntityTraits().setColor(3);
		pWorldDraw->subEntityTraits().setLineWeight(AcDb::kLnWt025);
		const auto jds = _horizontalAlignment.GetJds();
		const int jdSize = static_cast<int>(jds.size());
		AcGePoint3dArray jdPoints(jdSize);
		for (int i = 0; i < jdSize; ++i)
		{
			AcGePoint3d point(jds[i].E, jds[i].N, 0);
			AcGeVector3d direction(1, 0, 0);
			ret = pWorldDraw->geometry().circle(point, 2, normal);
			ret = pWorldDraw->geometry().text(point, normal, direction, 7.0, 1, 0,
			                                  std::format(L"  JD{}", i).c_str());
			jdPoints.append({jds[i].E, jds[i].N, 0});
		}

		ret = pWorldDraw->geometry().polyline(jdPoints.length(), jdPoints.asArrayPtr());
		return ret;
	}
	catch (const std::invalid_argument& e)
	{
		acutPrintf(L"%s", e.what());
		return false;
	}
	catch (NotInLineException& e)
	{
		acutPrintf(L"%s", e.GetMsg().c_str());
		return false;
	}
	catch (VizRailCoreException& e)
	{
		acutPrintf(L"%s", e.GetMsg().c_str());
		return false;
	}
	catch (std::exception& e)
	{
		acutPrintf(L"%s", e.what());
		return false;
	}
	catch (...)
	{
		acutPrintf(L"未知错误");
		return false;
	}
}

Acad::ErrorStatus HorizontalAlignmentEntity::subTransformBy(const AcGeMatrix3d& xform)
{
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::subGetTransformedCopy(const AcGeMatrix3d& xform, AcDbEntity*& pEnt) const
{
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::subGetGripPoints(AcGePoint3dArray& gripPoints, AcDbIntArray& osnapModes,
                                                              AcDbIntArray& geomIds) const
{
	const auto jds = _horizontalAlignment.GetJds();
	for (size_t i = 0; i < jds.size(); i++)
	{
		gripPoints.append(AcGePoint3d(jds[i].E, jds[i].N, 0));
		osnapModes.append(0);
		geomIds.append(static_cast<int>(i));
	}
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::subMoveGripPointsAt(const AcDbIntArray& indices,
                                                                 const AcGeVector3d& offset)
{
	const auto jds = _horizontalAlignment.GetJds();
	try
	{
		for (const auto& i : indices)
		{
			_horizontalAlignment.MoveJd(i, offset.y, offset.x);
		}
	}
	catch (const VizRailCoreException& e)
	{
		acutPrintf(L"%s", e.GetMsg().c_str());
		return Acad::eInvalidInput;
	}
	catch (const std::exception& e)
	{
		acutPrintf(L"%s", e.what());
		return Acad::eInvalidInput;
	}catch (...)
	{
		acutPrintf(L"未知错误");
		return Acad::eInvalidInput;
	}
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::subGetGeomExtents(AcDbExtents& extents) const
{
	return Acad::eOk;
}

bool HorizontalAlignmentEntity::DrawHectoMeter(const AcGiWorldDraw* pWorldDraw,
                                               const std::shared_ptr<VizRailCore::LineElement>& line,
                                               const double startMileage, const double endMileage)
{
	bool ret = false;
	pWorldDraw->subEntityTraits().setColor(3);
	pWorldDraw->subEntityTraits().setLineWeight(AcDb::kLnWt015);
	const AcGeVector3d normal(0, 0, 1);
	for (int i = (static_cast<int>(startMileage) / 100 + 1) * 100; i < endMileage; i += 100)
	{
		const auto coordinate = line->MileageToCoordinate(i);
		const auto azimuthAngle = line->MileageToAzimuthAngle(i);
		AcGePoint3dArray tmp1(2);
		const double dx = 10 * VizRailCore::Angle::Cos(azimuthAngle - VizRailCore::Angle::HalfPi());
		const double dy = 10 * VizRailCore::Angle::Sin(azimuthAngle - VizRailCore::Angle::HalfPi());
		tmp1[0] = {coordinate.X(), coordinate.Y(), 0};
		tmp1[1] = {coordinate.X() + dx, coordinate.Y() + dy, 0};
		ret = pWorldDraw->geometry().polyline(2, tmp1.asArrayPtr());
		AcGeVector3d direction(dx, dy, 0);
		if (i % 1000 == 0)
		{
			VizRailCore::Mileage mileage(i);
			auto prefix = mileage.Prefix();
			auto km = i / 1000;
			ret = pWorldDraw->geometry().text(tmp1[1], normal, direction, 7.0, 1,
			                                  0, std::format(L"  {} {}", prefix, km).c_str());
		}
		else
		{
			int m = (i / 100) % 10;
			ret = pWorldDraw->geometry().text(tmp1[1], normal, direction, 7.0, 1,
			                                  0, std::format(L"  {}", m).c_str());
		}
	}
	return ret;
}

bool HorizontalAlignmentEntity::DrawIntermediateLine(const AcGiWorldDraw* pWorldDraw,
                                                     const std::shared_ptr<VizRailCore::IntermediateLine>& jzx)
{
	bool ret = false;
	const auto startPoint = jzx->StartPoint();
	const auto endPoint = jzx->EndPoint();
	AcGePoint3dArray tmp(2);
	tmp.append({startPoint.X(), startPoint.Y(), 0});
	tmp.append({endPoint.X(), endPoint.Y(), 0});

	pWorldDraw->subEntityTraits().setLineWeight(AcDb::kLnWt050);
	pWorldDraw->subEntityTraits().setColor(3);
	ret = pWorldDraw->geometry().polyline(2, tmp.asArrayPtr());
	DrawHectoMeter(pWorldDraw, jzx, jzx->StartMileage().Value(), jzx->EndMileage().Value());
	return ret;
}

bool HorizontalAlignmentEntity::MileageMark(const AcGiWorldDraw* pWorldDraw, const AcGePoint3d& pt,
                                            const VizRailCore::Angle& azimuthAngle, const AcString& str)
{
	AcGePoint3dArray tmp1(2);
	const double dx = 10 * VizRailCore::Angle::Cos(azimuthAngle - VizRailCore::Angle::HalfPi());
	const double dy = 10 * VizRailCore::Angle::Sin(azimuthAngle - VizRailCore::Angle::HalfPi());
	tmp1[0] = pt;
	tmp1[1] = {pt.x + dx, pt.y + dy, 0};
	bool ret = pWorldDraw->geometry().polyline(2, tmp1.asArrayPtr());
	const AcGeVector3d normal(0, 0, 1);
	const AcGeVector3d direction(dx, dy, 0);
	ret = pWorldDraw->geometry().text(tmp1[1], normal, direction, 7.0, 1,
	                                  0, str);
	return ret;
}

bool HorizontalAlignmentEntity::DrawCurve(const AcGiWorldDraw* pWorldDraw,
                                          const std::shared_ptr<VizRailCore::Curve>& qx)
{
	bool ret = false;
	const auto& mileageZH = qx->K(VizRailCore::SpecialPoint::ZH);
	const auto& mileageHY = qx->K(VizRailCore::SpecialPoint::HY);
	const auto& mileageYH = qx->K(VizRailCore::SpecialPoint::YH);
	const auto& mileageHZ = qx->K(VizRailCore::SpecialPoint::HZ);
	AcGePoint3dArray transitionTmp1;
	AcGePoint3dArray transitionTmp2;
	AcGePoint3dArray curveTmp;
	const auto ZH = qx->MileageToCoordinate(mileageZH);
	const auto aZH = qx->MileageToAzimuthAngle(mileageZH);
	const auto HY = qx->MileageToCoordinate(mileageHY);
	const auto aHY = qx->MileageToAzimuthAngle(mileageHY);
	const auto YH = qx->MileageToCoordinate(mileageYH);
	const auto aYH = qx->MileageToAzimuthAngle(mileageYH);
	const auto HZ = qx->MileageToCoordinate(mileageHZ);
	const auto aHZ = qx->MileageToAzimuthAngle(mileageHZ);

	pWorldDraw->subEntityTraits().setLineWeight(AcDb::kLnWt050);
	// 前缓和曲线
	for (double j = mileageZH.Value(); j < mileageHY.Value(); ++j)
	{
		const auto coordinate = qx->MileageToCoordinate(j);
		transitionTmp1.append({coordinate.X(), coordinate.Y(), 0});
	}
	transitionTmp1.append({HY.X(), HY.Y(), 0});
	pWorldDraw->subEntityTraits().setColor(2);
	ret = pWorldDraw->geometry().polyline(transitionTmp1.length(), transitionTmp1.asArrayPtr());

	// 圆曲线部分
	for (double j = mileageHY.Value(); j < mileageYH.Value(); ++j)
	{
		const auto coordinate = qx->MileageToCoordinate(j);
		curveTmp.append({coordinate.X(), coordinate.Y(), 0});
	}
	curveTmp.append({YH.X(), YH.Y(), 0});
	pWorldDraw->subEntityTraits().setColor(1);
	ret = pWorldDraw->geometry().polyline(curveTmp.length(), curveTmp.asArrayPtr());

	// 后缓和曲线
	for (double j = mileageYH.Value(); j < mileageHZ.Value(); ++j)
	{
		const auto coordinate = qx->MileageToCoordinate(j);
		transitionTmp2.append({coordinate.X(), coordinate.Y(), 0});
	}
	transitionTmp2.append({HZ.X(), HZ.Y(), 0});
	pWorldDraw->subEntityTraits().setColor(2);
	ret = pWorldDraw->geometry().polyline(transitionTmp2.length(), transitionTmp2.asArrayPtr());

	ret = DrawHectoMeter(pWorldDraw, qx, mileageZH.Value(), mileageHZ.Value());
	ret = MileageMark(pWorldDraw, {ZH.X(), ZH.Y(), 0}, aZH, AcString(std::format(L" ZH {}", mileageZH.GetString())));
	ret = MileageMark(pWorldDraw, {HY.X(), HY.Y(), 0}, aHY, AcString(std::format(L" HY {}", mileageHY.GetString())));
	ret = MileageMark(pWorldDraw, {YH.X(), YH.Y(), 0}, aYH, AcString(std::format(L" YH {}", mileageYH.GetString())));
	ret = MileageMark(pWorldDraw, {HZ.X(), HZ.Y(), 0}, aHZ, AcString(std::format(L" HZ {}", mileageHZ.GetString())));
	return ret;
}

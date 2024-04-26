#include "stdafx.h"
#include "HorizontalAlignmentEntity.h"

#include <format>

#include "../VizRailCore/includes/Exceptions.h"


ACRX_DXF_DEFINE_MEMBERS(HorizontalAlignmentEntity, AcDbEntity,
                        AcDb::kDHL_CURRENT, AcDb::kMReleaseCurrent, 0, HORIZONTAL, /*MSG0*/"AutoCAD")

HorizontalAlignmentEntity::HorizontalAlignmentEntity(const AcString& name, const std::vector<Jd>& jds)
{
	_name = name;
	_horizontalAlignment.AddJd(jds);
}

Acad::ErrorStatus HorizontalAlignmentEntity::dwgInFields(AcDbDwgFiler* filer)
{
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::dwgOutFields(AcDbDwgFiler* filer) const
{
	return Acad::eOk;
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
		const double totalMileage = _horizontalAlignment.GetTotalMileage();

		std::vector<AcGePoint3d> points(static_cast<size_t>(totalMileage) + 1);
		// 计算百米标坐标
		for (int i = 0; i < totalMileage; i += 1)
		{
			const VizRailCore::Point2D coordinate = _horizontalAlignment.MileageToCoordinate(i);
			points[i] = {coordinate.X(), coordinate.Y(), 0};
		}
		const VizRailCore::Point2D lastCoordinate = _horizontalAlignment.MileageToCoordinate(totalMileage);
		points[points.size() - 1] = {lastCoordinate.X(), lastCoordinate.Y(), 0};
		AcGiPolyline polyLine(static_cast<int>(points.size()), points.data());
		pWorldDraw->subEntityTraits().setColor(1);
		polyLine.setThickness(1);
		bool ret = pWorldDraw->geometry().polyline(polyLine);
		const auto jds = _horizontalAlignment.GetJds();
		std::vector<AcGePoint3d> jdPoints(jds.size());
		for (size_t i = 0; i < jds.size(); ++i)
		{
			AcGePoint3d point(jds[i].E, jds[i].N, 0);
			AcGeVector3d normal(0, 0, 1);
			AcGeVector3d direction(1, 0, 0);
			ret = pWorldDraw->geometry().circle(point, 2, normal);
			ret = pWorldDraw->geometry().text(point, normal, direction, 10.0, 5, 0,
			                                  std::format(L"JD{}", jds[i].JdH).c_str());
			jdPoints[i] = {jds[i].E, jds[i].N, 0};
		}

		pWorldDraw->subEntityTraits().setColor(2);
		AcGiPolyline jdPolyLine(static_cast<int>(jdPoints.size()), jdPoints.data());
		jdPolyLine.setThickness(0.5);
		ret = pWorldDraw->geometry().polyline(jdPolyLine);
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
			Jd jd = jds.at(i);
			jd.E += offset.x;
			jd.N += offset.y;
			_horizontalAlignment.UpdateJd(i, jd);
		}
	}
	catch (const VizRailCoreException& e)
	{
		acutPrintf(L"%s", e.GetMsg().c_str());
	}
	catch (const std::exception& e)
	{
		acutPrintf(L"%s", e.what());
	}catch (...)
	{
		acutPrintf(L"未知错误");
	}
	return Acad::eOk;
}

Acad::ErrorStatus HorizontalAlignmentEntity::subGetGeomExtents(AcDbExtents& extents) const
{
	return Acad::eOk;
}

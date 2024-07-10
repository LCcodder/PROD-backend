class CountryController {
    #model;

    constructor (sequelize) {
        
        this.#model = sequelize.model('countries');
        
    }

    getAllCountries = async (req, res) => {
        try {
            const region = req.query["region"]
            console.log(region)

            const availableRegions = ["Europe", "Africa", "Americas", "Oceania", "Asia"]
            if (Array.isArray(region)) { 
                for (const eachRegion of region) {
                    
                    if (!availableRegions.includes(eachRegion)) {
                        return res.status(400).json({
                            reason: "Invalid regions"
                        })
                    }
                }
            } else if (region) {
                if (!availableRegions.includes(region)) {
                    return res.status(400).json({
                        reason: "Invalid regions"
                    })
                }
            }
            
            let countries = await this.#model.findAll({
                where: region ? {
                    region: region
                } : {},
                order: [
                    'alpha2'
                ],
                attributes: {
                    exclude: ["id"]
                }
            })
            return res.status(200).json(countries)

            
        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    getCountryByAlpha2 = async (req, res) => {
        try {
            const alpha2 = req.params.alpha2
            let country = await this.#model.findOne({
                where: {
                    alpha2: alpha2
                },
                attributes: {
                    exclude: ["id"]
                }
            })

            return res.status(country ? 200 : 404).json(country ? country: {
                reason: `Could not find country by alpha2: '${alpha2}'`
            })
        } catch (error) {
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }
}

module.exports = {CountryController}